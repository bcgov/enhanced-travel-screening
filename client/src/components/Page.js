import React, { Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

import Header from './Header';

const useStyles = makeStyles(() => ({
  root: {
    minHeight: 'calc(100vh - 82px)',
    height: 'calc(100vh - 82px)',
    backgroundColor: '#F5F5F5',
  },
}));

const Page = ({ headerChildren, children }) => {
  const classes = useStyles();
  return (
    <Fragment>
      <Header>
        {headerChildren}
      </Header>
      <Grid className={classes.root} container alignItems="top" justify="center">
        {children}
      </Grid>
    </Fragment>
  );
};

export default Page;
