import React, { Fragment } from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { useField } from 'formik';

const RenderDateField = ({
  field,
  form: { touched, errors },
  ...props
}) => {
  const [_, __, helpers] = useField(field.name);
  const { setValue, setTouched } = helpers;
  return (
    <Fragment>
      <KeyboardDatePicker
        format="MM/DD/YYYY"
        value={field.value}
        onBlur={() => setTouched(true)}
        onClose={() => setTouched(true)}
        onChange={(value) => setValue((value) ? value.format('MM/DD/YYYY') : '')}
        invalidDateMessage={null}
        openTo="date"
        variant="dialog"
        inputVariant="filled"
        {...props}
      />
      {(touched[field.name] && !!errors[field.name]) && <FormHelperText error>{errors[field.name]}</FormHelperText>}
    </Fragment>
  );
};

export { RenderDateField };
