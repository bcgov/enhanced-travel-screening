import * as yup from 'yup';
import { createError } from '@typescript-eslint/typescript-estree/dist/node-utils';
import { MessageParams } from 'yup/lib/types';
import { TestContext } from 'yup';

const provinces = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Québec',
  'Saskatchewan',
  'Nunavut',
  'Northwest Territories',
  'Yukon',
  'Other',
];

const validateDateString = s => {
  if (/^\d{4}[\\/\-.]\d{2}[\\/\-.]\d{2}$/.test(s) === false) return false;
  const date = Date.parse(s);
  return typeof date === 'number' && !Number.isNaN(date);
};

const validatePastDateString = (s: string) => {
  if (!validateDateString(s)) return false;
  // return false if before 1900
  if (Date.parse(s) - Date.parse('1900-01-01') < 0) return false;

  // return false if ahead of current date
  return Date.parse(s) <= Date.parse(new Date().toString());
};

const validateUniqueArray = a => Array.isArray(a) && new Set(a).size === a.length;

const PHONE_NUMBER_PATTERN =
  /^((\+?[1-9]{1,4}[ \\-]*)|(\([0-9]{2,3}\)[ .\\-]*)|([0-9]{2,4})[ .\\-]*)*?[0-9]{3,4}?[ .\\-]*[0-9]{3,4}?$/;
const validatePhoneNumber = value => {
  if (!value) return true;
  if (!PHONE_NUMBER_PATTERN.test(value)) {
    return false;
  }
  return true;
};

const DeterminationSchema = yup
  .object()
  .noUnknown()
  .shape({
    determination: yup
      .string()
      .oneOf(['support', 'accepted'])
      .required('Determination is required'),
    notes: yup.string().required('Notes are required'),
  });

const checkRequired = <T>(value: T, context: TestContext): boolean => {
  const { path, parent } = context;
  if (value === null || value === undefined || (value as any) === '') {
    const message = `${parent.covid_id}: ${path} is required`;
    throw new yup.ValidationError(message, value, path);
  }
  return true;
};

const prependErrorWithKey = <T>(
  value: T,
  context: TestContext,
  callback: null | ((value: T) => boolean),
  required = false
): boolean => {
  if (required) {
    checkRequired(value, context);
  }
  const { path, parent } = context;
  if (callback && !callback(value)) {
    const message = `${parent.covid_id}: ${path} is invalid`;
    throw new yup.ValidationError(message, value, path);
  }
  return true;
};

const PhacSchema = yup
  .array()
  .required('Submission must contain at least one item')
  .of(
    yup
      .object()
      .shape({
        covid_id: yup.string().test('required', checkRequired),
        date_of_birth: yup.string().test('is-date', (value, context) => {
          return prependErrorWithKey(value, context, validatePastDateString, true);
        }),
        arrival_date: yup.string().test('is-date', (value, context) => {
          prependErrorWithKey(value, context, validateDateString, true);
          const { path, parent } = context;
          if (Date.parse(value) < Date.parse(parent.date_of_birth)) {
            const message = `${parent.covid_id}: ${path} should be later than date of birth`;
            return new yup.ValidationError(message, value, path);
          }
          return true;
        }),
        end_of_isolation: yup.string().test('is-date', (value, context) => {
          const { path, parent } = context;
          prependErrorWithKey(value, context, validateDateString, true);
          if (Date.parse(value) < Date.parse(parent.arrival_date)) {
            const message = `${parent.covid_id}: ${path} should be later than arrival date`;
            return new yup.ValidationError(message, value, path);
          }
          return true;
        }),
        home_phone: yup.string().test('is-phone-number', (value, context) => {
          return prependErrorWithKey(value, context, validatePhoneNumber);
        }),
        mobile_phone: yup.string().test('is-phone-number', (value, context) => {
          return prependErrorWithKey(value, context, validatePhoneNumber);
        }),
        other_phone: yup.string().when(['home_phone', 'mobile_phone'], {
          is: (homePhone, mobilePhone) => !homePhone && !mobilePhone,
          then: yup.string().test('is-phone-number', (value, context) => {
            if (!value) {
              const { path, parent } = context;
              const message = `${parent.covid_id}: ${path} - At least one phone is required`;
              return new yup.ValidationError(message, value, path);
            }
            return prependErrorWithKey(value, context, validatePhoneNumber);
          }),
          otherwise: yup.string().test('is-phone-number', (value, context) => {
            return prependErrorWithKey(value, context, validatePhoneNumber);
          }),
        }),
        province_territory: yup.string().test('required', checkRequired),
      })
      .test(
        'no-empty-keys',
        'Empty keys are not allowed',
        v =>
          !Object.keys(v)
            .map(k => k.trim())
            .includes('')
      )
  );

const FormSchema = yup
  .object()
  .noUnknown()
  .shape({
    // Primary contact
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    // telephone: yup.string().required().matches(/^\d{10}$/),
    telephone: yup.string().required('Telephone number is required'),
    email: yup
      .string()
      .nullable()
      .matches(/^(.+@.+\..+)?$/, 'Invalid email address'),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    province: yup.string().required('Province is required').oneOf(provinces, 'Invalid province'),
    // postalCode: yup.string().required().matches(/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/),
    postalCode: yup.string().nullable(),
    dob: yup
      .string()
      .required('Date of birth is required')
      .test('is-date', 'Not a valid date', validatePastDateString),

    // Travel information
    includeAdditionalTravellers: yup
      .boolean()
      .typeError('Must specify additional travellers')
      .required('Must specify additional travellers'),
    additionalTravellers: yup.array().when('includeAdditionalTravellers', {
      is: true,
      then: yup
        .array()
        .required('Traveller information is required')
        .of(
          yup
            .object()
            .noUnknown(true, 'Unknown key for additional traveller information')
            .shape({
              firstName: yup.string().required('First name is required'),
              lastName: yup.string().required('Last name is required'),
              dob: yup
                .string()
                .required('Date of birth is required')
                .test('is-date', 'Not a valid date', validatePastDateString),
            })
        )
        .test(
          'is-length',
          'Number of additional travellers must be between 1 and 10',
          v => v.length >= 1 && v.length <= 10
        ),
      otherwise: yup
        .array()
        .test('is-empty', 'Additional travellers must be empty', v => v && v.length === 0),
    }),
    arrival: yup
      .object()
      .noUnknown(true, 'Unknown key for arrival information')
      .shape({
        date: yup
          .string()
          .required('Arrival date is required')
          .test('is-date', 'Not a valid date', validateDateString),
        by: yup
          .string()
          .required('Arrival method is required')
          .oneOf(['air', 'sea', 'land'], 'Invalid arrival method'),
        from: yup.string().required('Arrival city and country are required'),
        flight: yup.string().nullable(),
      }),

    // Isolation plan
    accomodations: yup
      .boolean()
      .typeError('Must specify if accommodations are available')
      .required('Must specify if accommodations are available'),
    isolationPlan: yup.object().when('accomodations', {
      is: true,
      then: yup
        .object()
        .noUnknown(true, 'Unknown key in isolation plan')
        .shape({
          city: yup.string().required('Isolation city is required'),
          address: yup.string().required('Isolation address is required'),
          type: yup
            .string()
            .required('Isolation type is required')
            .oneOf(['private', 'family', 'commercial'], 'Invalid isolation type'),
        }),
      otherwise: yup
        .object()
        .nullable()
        .test('is-null', 'Isolation plan must be null', v => v == null),
    }),
    supplies: yup
      .boolean()
      .typeError('Must specify if able to make isolation arrangements')
      .required('Must specify if able to make isolation arrangements'),
    ableToIsolate: yup
      .boolean()
      .typeError('Must specify whether accommodation assistance is required')
      .required('Must specify whether accommodation assistance is required'),
    transportation: yup
      .array()
      .of(
        yup
          .string()
          .required('Transportation type is required')
          .oneOf(['taxi', 'personal', 'public'], 'Invalid transportation type')
      )
      .test('is-unique-array', 'Transportation types must be unique', validateUniqueArray),

    // Certify
    certified: yup
      .boolean()
      .typeError('Must certify submitted information')
      .required('Must certify submitted information')
      .test('is-true', 'Certify must be true', v => v === true),
  });

const validate = async (schema, data) => schema.validate(data, { strict: true, abortEarly: false });

export { DeterminationSchema, FormSchema, PhacSchema, validate };
