import React, { Fragment } from 'react';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { useField } from 'formik';

import { InputFieldError } from '../generic';

const useStyles = makeStyles((theme) => ({
  button: {
    padding: theme.spacing(2),
    boxShadow: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    lineHeight: '18px',
    letterSpacing: '0.81px',
  },
  buttonError: {
    borderColor: theme.palette.error.main,
    '&:hover': {
      borderColor: theme.palette.error.main,
    },
  },
}));

const RenderButtonGroup = ({
  field,
  form,
  options,
  ...props
}) => {
  const classes = useStyles();
  const [_, __, helpers] = useField(field.name);
  const { setValue } = helpers;
  const touched = form.errors[field.name];
  const error = form.errors[field.name];
  return (
    <Fragment>
      <ButtonGroup
        orientation="vertical"
        color="primary"
        fullWidth
        {...props}
      >
        {options.map((option) => (
          <Button
            className={classnames(classes.button, { [classes.buttonError]: !!error })}
            key={option.value}
            onClick={(e) => setValue(option.value)}
            variant={(option.value === field.value) ? 'contained' : 'outlined'}
            color={(option.value === field.value) ? option.color : 'primary'}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
      {(touched && error) && <InputFieldError error={error} />}
    </Fragment>
  );
};

export { RenderButtonGroup };
