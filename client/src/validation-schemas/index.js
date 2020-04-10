import * as Yup from 'yup';

// TODO: Add `.email()` to `username` once backend work is complete.
export const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Required'),
  password: Yup.string().required('Required'),
});

export const LookupSchema = Yup.object().shape({
  confirmationNumber: Yup.string().required('Required'),
});

export const SidebarSchema = Yup.object().shape({
  determination: Yup.string().required('Required'),
  notes: Yup.string().required('Required'),
});
