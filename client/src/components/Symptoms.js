import React from 'react';
import { Grid, Typography, TextField, InputLabel, FormControlLabel, Checkbox } from '@material-ui/core';

const Symptoms = ({ classes, saveSymptoms, saveRiskGroups, symptoms, riskGroups }) => {

  return (
    <Grid style={{padding: "1rem"}} container>
      <Grid item xs={12}>
        <Typography className={classes.cardTitle} variant="h6">
          Symptom Self Check
        </Typography>
        <hr className={classes.hr} />
        <Typography variant="subtitle1" style={{paddingTop: "0.5rem"}}>
          <b>Do you or any of your household travellers have the following symptoms?</b>
        </Typography>
        <Typography variant="subtitle2" style={{paddingTop: "0.5rem"}}>
          Check all that apply
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={symptoms.fever}
                  onChange={(e) => saveSymptoms(e.target.name, e.target.checked)}
                  name="fever"
                />
              }
              label="Fever"
            />
          </Grid>
          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={symptoms.cough}
                  onChange={(e) => saveSymptoms(e.target.name, e.target.checked)}
                  name="cough"
                />
              }
              label="Cough"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={symptoms.breathing}
                  onChange={(e) => saveSymptoms(e.target.name, e.target.checked)}
                  name="breathing"
                />
              }
              label="Difficulty Breathing"
            />
          </Grid>
          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={symptoms.other}
                  onChange={(e) => saveSymptoms(e.target.name, e.target.checked)}
                  name="other"
                />
              }
              label="Other"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={symptoms.none}
                  onChange={(e) => saveSymptoms(e.target.name, e.target.checked)}
                  name="none"
                />
              }
              label="None of the above"
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <InputLabel htmlFor="role">
          If other was selected, please describe your symptoms
        </InputLabel>
        <TextField
          onChange={(e => saveSymptoms(e.target.value, 'otherSymptoms'))}
          name="otherSymptoms"
          className={`${classes.stretch} ${classes.textField}`}
          id="symptomsDescription"
          label=""
          variant="outlined"
          rows="2"
          multiline
          fullWidth
        />
      </Grid>

      <Grid container style={{ marginTop: "2rem" }}>

        <Grid item xs={12}>
          <Typography variant="subtitle1" style={{paddingTop: "0.5rem"}}>
            <b>Do you or any of your household travellers have the following symptoms?</b>
          </Typography>
          <Typography variant="subtitle2" style={{paddingTop: "0.5rem"}}>
            Check all that apply
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Grid container>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={riskGroups.overSixty}
                    onChange={(e) => saveRiskGroups(e.target.name, e.target.checked)}
                    name="overSixty"
                  />
                }
                label="Over 60 years"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={riskGroups.cardiovascular}
                    onChange={(e) => saveRiskGroups(e.target.name, e.target.checked)}
                    name="cardiovascular"
                  />
                }
                label="Cardiovascular Disease"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Grid container>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={riskGroups.lung}
                    onChange={(e) => saveRiskGroups(e.target.name, e.target.checked)}
                    name="lung"
                  />
                }
                label="Chronic lung disease"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={riskGroups.diabetes}
                    onChange={(e) => saveRiskGroups(e.target.name, e.target.checked)}
                    name="diabetes"
                  />
                }
                label="Diabetes"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Grid container>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={riskGroups.immune}
                    onChange={(e) => saveRiskGroups(e.target.name, e.target.checked)}
                    name="immune"
                  />
                }
                label="Immune suppresion"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={riskGroups.none}
                    onChange={(e) => saveRiskGroups(e.target.name, e.target.checked)}
                    name="none"
                  />
                }
                label="No - none"
              />
            </Grid>
          </Grid>
        </Grid>

      </Grid>

    </Grid>
  )
}

export default Symptoms;
