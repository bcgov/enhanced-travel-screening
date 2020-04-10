import React, { Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

import { Header } from './Header';

const useStyles = makeStyles(() => ({
  root: {
    minHeight: 'calc(100vh - 82px)',
    height: 'calc(100vh - 82px)',
    backgroundColor: '#F5F6FA',
  },
}));

const Page = ({ children }) => {
  const classes = useStyles();
  return (
    <Fragment>
      <Header />
      <Grid className={classes.root} container justify="center">
        {children}
      </Grid>
    </Fragment>
  );
};

export { Page };
