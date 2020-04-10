import React, { Fragment } from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { useField } from 'formik';

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
  form: { errors },
  options,
  ...props
}) => {
  const classes = useStyles();
  const [_, __, helpers] = useField(field.name);
  const { setValue } = helpers;
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
            className={classnames(classes.button, { [classes.buttonError]: !!errors[field.name] })}
            key={option.value}
            onClick={(e) => setValue(option.value)}
            variant={(option.value === field.value) ? 'contained' : 'outlined'}
            color={(option.value === field.value) ? option.color : 'primary'}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
      {!!errors[field.name] && <FormHelperText error>{errors[field.name]}</FormHelperText>}
    </Fragment>
  );
};

export { RenderButtonGroup };
