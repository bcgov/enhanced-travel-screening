import React from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

const RenderRadioGroup = ({
  field,
  form: { touched, errors },
  options,
  disabled,
  ...props
}) => {
  return (
    <FormControl component="fieldset">
      <RadioGroup
        {...field}
        {...props}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            checked={field.value === option.value}
            label={option.label}
            labelPlacement="end"
            control={<Radio color={option.color || 'primary'} />}
          />
        ))}
      </RadioGroup>
      {(touched[field.name] && !!errors[field.name]) && <FormHelperText error>{errors[field.name]}</FormHelperText>}
    </FormControl>
  );
};

export { RenderRadioGroup };
