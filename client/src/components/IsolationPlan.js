import React from 'react';
import { Box, Typography, Grid, InputLabel, TextField, MenuItem, Select, Radio, RadioGroup, FormControl, FormControlLabel } from '@material-ui/core';

const IsolationPlan = ({ classes, accomodations, toggleAccomodations, saveIsolationPlan, formValues, isDisabled }) => {
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
        <Typography variant="subtitle1" style={{paddingTop: "0.5rem"}}>
          Do you have accomodations arranged for your self-isolation period?
        </Typography>
      </Grid>
      <Grid item xs={12} md={6} style={{marginBottom: "1rem"}}>
        <FormControl component="fieldset">
          <RadioGroup
            row
            aria-label="symptoms"
            name="symptoms"
            value={computeRadioValue(accomodations)}
            onChange={(event) => toggleAccomodations(event.target.value === "yes" )}>
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{marginTop: "0.75rem"}}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <InputLabel htmlFor="isolationTypeSelect">Isolation Type</InputLabel>
            <Select
              id="isolationTypeSelect"
              className={classes.select}
              name="type"
              value={isolationPlan.type || ""}
              variant="filled"
              onChange={handleChange}
              fullWidth
              displayEmpty
              inputProps={{disabled: isDisabled}}
            >
              <MenuItem value="" disabled>Please Select</MenuItem>
              <MenuItem value="private">Private Residence</MenuItem>
              <MenuItem value="family">With family</MenuItem>
              <MenuItem value="commercial">Commercial (hotel, BnB etc)</MenuItem>
              <MenuItem value="isolationCentre">Isolation Centre</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
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
            <Box>
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
        </Grid>
      </Grid>
      <Grid container style={{marginTop: "0.75rem"}}>
        <Grid item xs={12}>
          <Box>
            <Typography variant="subtitle2" style={{paddingTop: "0.5rem"}}>
              Are you able to self-isolate from anyone who is over 60 years old or who has heart disease, high blood pressure, asthma or other lung disease, diabetes, cancer, immune suppression or is taking prednisone medication?*
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                aria-label="able to isolate from immuno compromiseed"
                name="ableToIsolate"
                value={computeRadioValue(isolationPlan.ableToIsolate)}
                onChange={(event) => handleChange({ target: { name: "ableToIsolate", value: event.target.value === "yes" }})}>
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box>
            <Typography variant="subtitle2" style={{paddingTop: "0.5rem"}}>
              Are you able to make the necessary arrangements for your self-isolation period? (e.g. food, medication, child care, cleaning supplies, pet care).*
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
          </Box>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Box marginTop="0.75rem">
          <InputLabel htmlFor="transportation">
            What form of transportation will you take to your self-isolation location?*
          </InputLabel>
          <Select
            id="transportation"
            className={classes.select}
            name="transportation"
            value={isolationPlan.transportation || ""}
            variant="filled"
            onChange={handleChange}
            fullWidth
            displayEmpty
            inputProps={{disabled: isDisabled}}
          >
            <MenuItem value="" disabled>Required</MenuItem>
            <MenuItem value="personal">Personal Vehicle</MenuItem>
            <MenuItem value="public">Public Transportation</MenuItem>
            <MenuItem value="taxi">Taxi or Ride Share</MenuItem>

          </Select>
        </Box>
      </Grid>
      <div style={{
        margin: '2rem 0 0 0',
        boxSizing: 'border-box',
        height: '2px',
        width: '100%',
        border: '1px solid #CCCCCC',
      }}></div>
    </Grid>
  )
}

export default IsolationPlan;
