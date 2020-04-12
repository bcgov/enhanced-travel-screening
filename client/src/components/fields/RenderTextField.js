import React, { Fragment } from 'react';
import TextField from '@material-ui/core/TextField';
import { ErrorMessage } from 'formik';

import { InputFieldLabel, InputFieldError } from '../generic';

const RenderTextField = ({
  field,
  form,
  label,
  options,
  ...props
}) => {
  const touched = form.touched[field.name];
  const error = form.errors[field.name];
  return (
    <Fragment>
      {label && <InputFieldLabel label={label} />}
      <TextField
        variant="filled"
        fullWidth
        error={touched && !!error}
        {...field}
        {...props}
      />
      <InputFieldError error={<ErrorMessage name={field.name} />} />
    </Fragment>
  );
};

export { RenderTextField };
