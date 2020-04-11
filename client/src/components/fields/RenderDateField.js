import React, { Fragment } from 'react';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { useField } from 'formik';

import { dateToString, stringToDate } from '../../utils';

import { InputFieldError, InputFieldLabel } from '../generic';

const RenderDateField = ({
  field,
  form,
  label,
  ...props
}) => {
  const [_, __, helpers] = useField(field.name);
  const { setValue, setTouched } = helpers;
  const touched = form.touched[field.name];
  const error = form.errors[field.name];
  return (
    <Fragment>
      {label && <InputFieldLabel label={label} />}
      <KeyboardDatePicker
        format="YYYY/MM/DD"
        value={!field.value ? null : stringToDate(field.value)}
        onChange={(value) => setValue(dateToString(value))}
        onBlur={() => setTouched(true)}
        onClose={() => setTouched(true)}
        invalidDateMessage={null}
        minDateMessage={null}
        maxDateMessage={null}
        openTo="date"
        variant="dialog"
        inputVariant="filled"
        fullWidth
        {...props}
      />
      {(touched && error) && <InputFieldError error={error} />}
    </Fragment>
  );
};

export { RenderDateField };
