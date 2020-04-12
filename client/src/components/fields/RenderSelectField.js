import React, { Fragment } from 'react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { ErrorMessage } from 'formik';

import { InputFieldError, InputFieldLabel } from '../generic';

const RenderSelectField = ({
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
      <InputFieldError error={<ErrorMessage name={field.name} />} />
    </Fragment>
  );
};

export { RenderSelectField };
