import React, { Fragment } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { InputFieldLabel, InputFieldError } from '../generic';

const RenderCheckbox = ({
  field,
  form,
  label,
  ...props
}) => {
  const touched = form.errors[field.name];
  const error = form.errors[field.name];
  return (
    <Fragment>
      <FormControlLabel
        label={<InputFieldLabel label={label} />}
        control={
          <Checkbox
            color="primary"
            checked={field.value === true}
            {...field}
            {...props}
          />
        }
      />
      {(touched && error) && <InputFieldError error={error} />}
    </Fragment>
  );
};

export { RenderCheckbox };
