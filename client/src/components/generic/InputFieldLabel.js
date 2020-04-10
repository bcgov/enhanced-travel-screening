import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    color: '#333333',
    fontSize: '14px',
    letterSpacing: '-0.25px',
    lineHeight: '18px',
  },
}));

const InputFieldLabel = ({ label, ...props }) => {
  const classes = useStyles();
  return (
    <InputLabel className={classes.root} {...props}>
      {label}
    </InputLabel>
  );
};

export { InputFieldLabel };
