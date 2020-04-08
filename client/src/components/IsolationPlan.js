import React from 'react';
import { Box, Typography, Grid, InputLabel, TextField, MenuItem, Select, Radio, RadioGroup, FormControl, FormControlLabel } from '@material-ui/core';

const IsolationPlan = ({ classes, saveIsolationPlan, formValues }) => {
  const { isolationPlan } = formValues;
  const handleChange = (e) => {
    saveIsolationPlan(e.target.name, e.target.value)
  }
  const computeRadioValue = (val) => val === null ? null : val ? "yes" : "no"
  return (
    <Grid style={{padding: "1rem"}} container>
      <Grid item xs={12}>
        <Typography className={classes.cardTitle} variant="h6">
          Self Isolation Plan
        </Typography>
        <hr className={classes.hr} />
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={12} md={6}>
            <Box padding="1rem 1rem 1rem 0">
              <InputLabel htmlFor="isolationCity">Which city will you be isolating in?</InputLabel>
              <TextField
                id="isolationCity"
                className={classes.textField}
                name="city"
                value={isolationPlan.city}
                variant="filled"
                onChange={handleChange}
                fullWidth
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box padding="1rem 0 1rem 1rem">
              <InputLabel htmlFor="isolationAddress">What is the address you will be staying at?</InputLabel>
              <TextField
                id="isolationAddress"
                className={classes.textField}
                name="address"
                value={isolationPlan.address}
                variant="filled"
                onChange={handleChange}
                fullWidth
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <InputLabel htmlFor="provSelect">Isolation Type</InputLabel>
            <Select
              id="provSelect"
              className={classes.select}
              name="type"
              value={isolationPlan.type || ""}
              variant="filled"
              onChange={handleChange}
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>Please Select</MenuItem>
              <MenuItem value="private">Private Residence</MenuItem>
              <MenuItem value="family">With family</MenuItem>
              <MenuItem value="commercial">Commercial (hotel, BnB etc)</MenuItem>
              <MenuItem value="isolationCentre">Isolation Centre</MenuItem>
              <MenuItem value="other">Other</MenuItem>

            </Select>
          </Grid>

          <Grid container style={{marginTop: "0.75rem"}}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" style={{paddingTop: "0.5rem"}}>
                Is any member of the household where you are isolating a health professional?
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="withProfessional"
                  name="withProfessional"
                  value={computeRadioValue(isolationPlan.withProfessional)}
                  onChange={(event) => handleChange({ target: { name: "withProfessional", value: event.target.value === "yes" }})}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" style={{paddingTop: "0.5rem"}}>
                Do you have independent transportation to the isolation premises (not public transportation, or taxi, or ride sharing)
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="independentTransport"
                  name="independentTransport"
                  value={computeRadioValue(isolationPlan.independentTransport)}
                  onChange={(event) => handleChange({ target: { name: "independentTransport", value: event.target.value === "yes" }})}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" style={{paddingTop: "0.5rem"}}>
                Do you have prescriptions or supplies for 14 days of isolation (food, cleaning supplies, other)?
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="supplies"
                  name="supplies"
                  value={computeRadioValue(isolationPlan.supplies)}
                  onChange={(event) => handleChange({ target: { name: "supplies", value: event.target.value === "yes" }})}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" style={{paddingTop: "0.5rem"}}>
                If you don't have enough prescriptions or supplies, do you have someone who can obtain them for you?
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="suppliesSource"
                  name="suppliesSource"
                  value={computeRadioValue(isolationPlan.suppliesSource)}
                  onChange={(event) => handleChange({ target: { name: "suppliesSource", value: event.target.value === "yes" }})}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" style={{paddingTop: "0.5rem"}}>
                Do you have the support required for 14 days of isolation (child care, dog walking)?
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="support"
                  name="support"
                  value={computeRadioValue(isolationPlan.support)}
                  onChange={(event) => handleChange({ target: { name: "support", value: event.target.value === "yes" }})}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" style={{paddingTop: "0.5rem"}}>
                Do you have plans to be outdoors?
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="outdoors"
                  name="outdoors"
                  value={computeRadioValue(isolationPlan.outdoors)}
                  onChange={(event) => handleChange({ target: { name: "outdoors", value: event.target.value === "yes" }})}>
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
          <div style={{
            marginTop: '1rem',
            boxSizing: 'border-box',
            height: '2px',
            width: '100%',
            border: '1px solid #CCCCCC',
          }}></div>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default IsolationPlan;
