import React, { Fragment } from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { useField } from 'formik';

const useStyles = makeStyles((theme) => ({
  buttonGroup: {
    '& > button': {
      padding: theme.spacing(2),
      fontWeight: 'bold',
      fontSize: '13px',
      lineHeight: '18px',
      letterSpacing: '0.81px',
    },
  },
}));

const RenderButtonGroup = ({
  field,
  form: { touched, errors },
  options,
  disabled,
  ...props
}) => {
  const classes = useStyles();
  const [_, __, helpers] = useField(field.name);
  const { setValue } = helpers;
  return (
    <Fragment>
      <ButtonGroup
        className={classes.buttonGroup}
        orientation="vertical"
        color="primary"
        fullWidth
        {...props}
      >
        {options.map((option) => (
          <Button
            key={option.value}
            onClick={(e) => setValue(option.value)}
            variant={(option.value === field.value) ? 'contained' : 'outlined'}
            color={(option.value === field.value) ? option.color : 'primary'}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
      {(touched[field.name] && !!errors[field.name]) && <FormHelperText error>{errors[field.name]}</FormHelperText>}
    </Fragment>
  );
};

export { RenderButtonGroup };
