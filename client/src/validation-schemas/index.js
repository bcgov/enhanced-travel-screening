/* eslint-disable no-template-curly-in-string */
import * as yup from 'yup';

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
];

const validateDateString = (s) => {
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(s) === false) return false;
  const date = Date.parse(s);
  return typeof date === 'number' && !Number.isNaN(date);
};

const validateUniqueArray = (a) => (
  Array.isArray(a) && new Set(a).size === a.length
);

export const LoginSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

export const LookupSchema = yup.object().shape({
  confirmationNumber: yup.string().required('Confirmation number is required'),
});

export const DeterminationSchema = yup.object().shape({
  determination: yup.string().oneOf(['support', 'accepted']).required('Determination is required'),
  notes: yup.string().required('Notes are required'),
});

export const FormSchema = yup.object().noUnknown().shape({
  // Primary contact
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  // telephone: yup.string().required().matches(/^\d{10}$/),
  telephone: yup.string().required(),
  email: yup.string().nullable().matches(/^(.+@.+\..+)?$/),
  address: yup.string().required(),
  city: yup.string().required(),
  province: yup.string().required().oneOf(provinces),
  // postalCode: yup.string().required().matches(/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/),
  postalCode: yup.string().nullable(),
  dob: yup.string().required().test('is-date', '${path} is not a valid date', validateDateString),

  // Travel information
  includeAdditionalTravellers: yup.boolean().required(),
  numberOfAdditionalTravellers: yup.number().when('includeAdditionalTravellers', {
    is: true,
    then: yup.number().required().min(1).max(10),
    otherwise: yup.number().required().test('is-zero', '${path} must be zero', (v) => v === 0),
  }),
  additionalTravellers: yup.array().when('includeAdditionalTravellers', {
    is: true,
    then: yup.array().required().of(
      yup.object().noUnknown().shape({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        dob: yup.string().required().test('is-date', '${path} is not a valid date', validateDateString),
      }),
    ).test('is-length', '${path} has incorrect length', function _(v) { return v.length === this.parent.numberOfAdditionalTravellers; }),
    otherwise: yup.array().test('is-empty', '${path} is not empty array', (v) => v && v.length === 0),
  }),
  arrival: yup.object().noUnknown().shape({
    date: yup.string().required().test('is-date', '${path} is not a valid date', validateDateString),
    by: yup.string().required().oneOf(['air', 'sea', 'land']),
    from: yup.string().required(),
    flight: yup.string().nullable(),
  }),

  // Isolation plan
  accomodations: yup.boolean().required(),
  isolationPlan: yup.object().when('accomodations', {
    is: true,
    then: yup.object().noUnknown().shape({
      city: yup.string().required(),
      address: yup.string().required(),
      type: yup.string().required().oneOf(['private', 'family', 'commercial']),
    }),
    otherwise: yup.object().nullable().test('is-null', '${path} is not null', (v) => v == null),
  }),
  supplies: yup.boolean().required(),
  ableToIsolate: yup.boolean().required(),
  transportation: yup.array().of(
    yup.string().required().oneOf(['taxi', 'personal', 'public']),
  ).test('is-unique-array', '${path} must be a unique array', validateUniqueArray),

  // Certify
  certified: yup.boolean().required().test('is-true', '${path} is not true', (v) => v === true),
});
