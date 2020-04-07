import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

const Symptoms = ({ classes }) => {

  return (
    <Grid item xs={12}>
      <Typography className={classes.cardTitle} variant="h6">
        Symptoms
      </Typography>
    </Grid>
  )
}

export default Symptoms;
