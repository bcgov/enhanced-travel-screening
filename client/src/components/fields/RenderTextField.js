import React, { Fragment } from 'react';
import TextField from '@material-ui/core/TextField';

import { InputFieldLabel, InputFieldError } from '../generic';

const RenderTextField = ({
  field,
  form,
  label,
  options,
  ...props
}) => {
  const touched = form.errors[field.name];
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
      {(touched && error) && <InputFieldError error={error} />}
    </Fragment>
  );
};

export { RenderTextField };
