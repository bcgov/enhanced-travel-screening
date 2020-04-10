import React, { Fragment } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';

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
      <Grid container alignItems="center" spacing={1}>
        <Grid item>
          <Checkbox
            color="primary"
            {...field}
            {...props}
          />
        </Grid>
        {label && (
          <Grid item>
            <InputFieldLabel label={label} />
          </Grid>
        )}
      </Grid>
      {(touched && error) && <InputFieldError error={error} />}
    </Fragment>
  );
};

export { RenderCheckbox };
