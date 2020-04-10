import React, { Fragment } from 'react';

import { InputFieldLabel, InputFieldError } from '../generic';
import { RenderCheckbox } from './RenderCheckbox';

const RenderCheckboxGroup = ({
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
      {options.map((option) => (
        <RenderCheckbox
          key={option.value}
          form={form}
          field={{ ...field, value: option.value }}
          label={option.label}
          checked={field.value.includes(option.value)}
          {...props}
        />
      ))}
      {(touched && error) && <InputFieldError error={error} />}
    </Fragment>
  );
};

export { RenderCheckboxGroup };
