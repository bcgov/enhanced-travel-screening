import React from 'react';
import TextField from '@material-ui/core/TextField';

const RenderTextField = ({
  field,
  form: { touched, errors },
  options,
  disabled,
  ...props
}) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      error={touched[field.name] && !!errors[field.name]}
      helperText={(touched[field.name] && !!errors[field.name]) && errors[field.name]}
      {...field}
      {...props}
    />
  );
};

export { RenderTextField };
