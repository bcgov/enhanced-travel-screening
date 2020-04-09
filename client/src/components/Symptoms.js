import React from 'react';
import { Grid, Typography, Radio, RadioGroup, FormControlLabel, FormControl } from '@material-ui/core';

const Symptoms = ({ classes, toggleSymptoms, symptoms, isDisabled }) => {
  const computeRadioValue = (val) => val === null ? null : val ? "yes" : "no"
  return (
    <Grid style={{padding: "1rem"}} container>
      <Grid item xs={12}>
        <Typography className={classes.cardTitle} variant="h6">
          Symptom Self Check
        </Typography>
        <hr className={classes.hr} />
        <Typography variant="subtitle1" style={{paddingTop: "0.5rem"}}>
          Are you or anyone in your group experiencing any of the following symptoms (fever, cough, muscle aches, sore throat, shortness of breath, chills) now or in the last 10 days?
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset">
          <RadioGroup
            row
            aria-label="symptoms"
            name="symptoms"
            value={computeRadioValue(symptoms)}
            onChange={(event) => toggleSymptoms(event.target.value === "yes" )}>
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      </Grid>
    </Grid>
  )
}

export default Symptoms;
