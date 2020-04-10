import React from 'react';
import Typography from '@material-ui/core/Typography';
import MuiCard from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2),
    padding: theme.spacing(5, 4),
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 0 5px 0 #E5E9F2',
  },
  title: {
    fontSize: '27px',
    fontWeight: 'bold',
    letterSpacing: 0,
    lineHeight: '34px',
    textAlign: 'center',
    marginBottom: theme.spacing(3),
  },
}));

const Card = ({ children, title, ...props }) => {
  const classes = useStyles();
  return (
    <MuiCard className={classes.root} {...props}>
      <Typography className={classes.title}>
        {title}
      </Typography>
      {children}
    </MuiCard>
  )
};

export { Card };
