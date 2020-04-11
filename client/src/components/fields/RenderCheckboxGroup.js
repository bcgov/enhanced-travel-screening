import React, { Fragment } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { InputFieldLabel, InputFieldError } from '../generic';

const RenderCheckboxGroup = ({
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
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          label={<InputFieldLabel label={option.label} />}
          control={
            <Checkbox
              color="primary"
              value={option.value}
              checked={field.value.includes(option.value)}
            />
          }
          {...field}
          {...props}
        />
      ))}
      {(touched && error) && <InputFieldError error={error} />}
    </Fragment>
  );
};

export { RenderCheckboxGroup };
