/* eslint-disable no-template-curly-in-string */
const yup = require('yup');

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

const LoginSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const LookupSchema = yup.object().shape({
  confirmationNumber: yup.string().required('Confirmation number is required'),
});

const DeterminationSchema = yup.object().shape({
  determination: yup.string().required('Determination is required'),
  notes: yup.string().required('Notes are required'),
});

const FormSchema = yup.object().noUnknown().shape({
  // Primary contact
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  // telephone: yup.string().required().matches(/^\d{10}$/),
  telephone: yup.string().required(),
  email: yup.string().defined().matches(/^.+@.+\..+$/),
  address: yup.string().required(),
  city: yup.string().required(),
  province: yup.string().required().oneOf(provinces),
  // postalCode: yup.string().required().matches(/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/),
  postalCode: yup.string().defined().test('is-nullable-string', '${path} is empty', (v) => v == null || v.length > 0),
  dob: yup.string().required().test('is-date', '${path} is not a valid date', validateDateString),

  // Travel information
  includeAdditionalTravellers: yup.boolean().required(),
  additionalTravellers: yup.array().when('includeAdditionalTravellers', {
    is: true,
    then: yup.array().required().of(
      yup.object().noUnknown().shape({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        dob: yup.string().required().test('is-date', '${path} is not a valid date', validateDateString),
      }),
    ),
    otherwise: yup.array().test('is-empty', '${path} is not empty array', (v) => v && v.length === 0),
  }),
  arrival: yup.object().noUnknown().shape({
    date: yup.string().required().test('is-date', '${path} is not a valid date', validateDateString),
    by: yup.string().required().oneOf(['air', 'sea', 'land']),
    from: yup.string().required(),
    flight: yup.string().defined().test('is-nullable-string', '${path} is empty', (v) => v == null || v.length > 0),
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
    otherwise: yup.object().defined().test('is-null', '${path} is not null', (v) => v == null),
  }),
  supplies: yup.boolean().required(),
  ableToIsolate: yup.boolean().required(),
  transportation: yup.array().defined().of(
    yup.string().required().oneOf(['taxi', 'personal', 'public']),
  ).test('is-array', '${path} is not array', (v) => Array.isArray(v)),

  // Certify
  certified: yup.boolean().required().test('is-true', '${path} is not true', (v) => v === true),
});

const validate = async (schema, data) => schema.validate(data, { strict: true });

module.exports = {
  LoginSchema, LookupSchema, DeterminationSchema, FormSchema, validate,
};
