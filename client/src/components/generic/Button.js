import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiButton from '@material-ui/core/Button';

const Button = ({
  text,
  loading,
  disabled,
  ...props
}) => {
  return (
    <MuiButton
      disabled={loading || disabled}
      variant="contained"
      color="primary"
      fullWidth
      {...props}
    >
      {loading ? <CircularProgress size={24} /> : text}
    </MuiButton>
  )
};

export { Button };
