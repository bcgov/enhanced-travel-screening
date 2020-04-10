import React, { Fragment } from 'react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

import { InputFieldError, InputFieldLabel } from '../generic';

const RenderSelectField = ({
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
        select
        fullWidth
        variant="filled"
        error={touched && !!error}
        inputProps={{ displayEmpty: true }}
        {...field}
        {...props}
      >
        <MenuItem value="" disabled>Please Select</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </TextField>
      {(touched && error) && <InputFieldError error={error} />}
    </Fragment>
  );
};

export { RenderSelectField };
