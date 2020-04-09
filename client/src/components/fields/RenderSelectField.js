import React, { Fragment } from 'react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

const RenderSelectField = ({
  field,
  form: { touched, errors },
  options,
  ...props
}) => {
  return (
    <Fragment>
      <TextField
        select
        fullWidth
        variant="filled"
        inputProps={{ displayEmpty: true }}
        error={touched[field.name] && !!errors[field.name]}
        helperText={(touched[field.name] && !!errors[field.name]) && errors[field.name]}
        {...field}
        {...props}
      >
        <MenuItem value="" disabled>Please Select</MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </TextField>
    </Fragment>
  );
};

export { RenderSelectField };
