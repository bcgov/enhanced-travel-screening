import React from 'react';
import { Box, Typography, Grid, InputLabel, TextField, MenuItem, Select, Radio, RadioGroup, FormControl, FormControlLabel } from '@material-ui/core';

const IsolationPlan = ({ classes, toggleAccomodations, toggleAble, saveIsolationPlan, formValues, isDisabled, setTransportation }) => {
  const { isolationPlan, accomodations, ableToIsolate, transportation } = formValues;
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
          * Do you have accomodations arranged for your self-isolation period?
        </Typography>
      </Grid>
      <Grid item xs={12} md={6} style={{marginBottom: accomodations ? "1rem": "0.25rem"}}>
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
      {accomodations && <Grid item xs={12} style={{marginTop: "0.75rem"}}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <InputLabel htmlFor="isolationTypeSelect">* Isolation Type</InputLabel>
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
              required
            >
              <MenuItem value="" disabled>Please Select</MenuItem>
              <MenuItem value="private">Private residence</MenuItem>
              <MenuItem value="family">With family</MenuItem>
              <MenuItem value="commercial">Commercial (hotel)</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <InputLabel htmlFor="isolationCity">* Which city will you be isolating in?</InputLabel>
              <TextField
                id="isolationCity"
                className={classes.textField}
                name="city"
                value={isolationPlan.city}
                variant="filled"
                onChange={handleChange}
                fullWidth
                required
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <InputLabel htmlFor="isolationAddress">* What is the address where you'll be staying?</InputLabel>
              {/* TODO Make multiline, watch for style demons */}
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
      </Grid>}
      <Grid container style={{marginTop: accomodations ? "0.75rem" : "0"}}>
        <Grid item xs={12}>
          <Box>
            <Typography variant="subtitle1" style={{paddingTop: "0.5rem"}}>
              * Do you need accomodation assistance to self-isolate from anyone who is over 60 years old or who has heart disease, high blood pressure, asthma or other lung disease, diabetes, cancer, immune suppression or is taking prednisone medication?
            </Typography>
            <FormControl component="fieldset">
              {/* TODO handle this logic change / name change */}
              <RadioGroup
                row
                aria-label="able to isolate from immuno compromiseed"
                name="ableToIsolate"
                value={computeRadioValue(ableToIsolate)}
                onChange={(event) => toggleAble(event.target.value === "no")}>
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
          {/* TODO change to checkboxes */}
          <Select
            id="transportation"
            className={classes.select}
            name="transportation"
            value={transportation}
            variant="filled"
            onChange={setTransportation}
            fullWidth
            displayEmpty
            inputProps={{disabled: isDisabled}}
            multiple
          >
            <MenuItem value="personal">Personal Vehicle</MenuItem>
            <MenuItem value="public">Public Transportation</MenuItem>
            <MenuItem value="taxi">Taxi or Ride Share</MenuItem>

          </Select>
        </Box>
      </Grid>
      {!isDisabled && <div style={{
        margin: '2rem 0 0 0',
        boxSizing: 'border-box',
        height: '2px',
        width: '100%',
        border: '1px solid #CCCCCC',
      }}></div>}
    </Grid>
  )
}

export default IsolationPlan;
