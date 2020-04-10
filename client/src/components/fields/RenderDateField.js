import React, { Fragment } from 'react';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { useField } from 'formik';

import { InputFieldError, InputFieldLabel } from '../generic';

const RenderDateField = ({
  field,
  form,
  label,
  ...props
}) => {
  const [_, __, helpers] = useField(field.name);
  const { setValue, setTouched } = helpers;
  const touched = form.errors[field.name];
  const error = form.errors[field.name];
  return (
    <Fragment>
      {label && <InputFieldLabel label={label} />}
      <KeyboardDatePicker
        format="YYYY/MM/DD"
        value={field.value}
        onBlur={() => setTouched(true)}
        onClose={() => setTouched(true)}
        onChange={(value) => setValue((value) ? value.format('YYYY/MM/DD') : '')}
        invalidDateMessage={null}
        openTo="date"
        variant="dialog"
        inputVariant="filled"
        {...props}
      />
      {(touched && error) && <InputFieldError error={error} />}
    </Fragment>
  );
};

export { RenderDateField };
