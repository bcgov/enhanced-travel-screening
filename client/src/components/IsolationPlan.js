import React from 'react';
import {
  Box,
  Typography,
  Grid,
  InputLabel,
  TextField,
  MenuItem,
  Select,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  FormGroup,
  Checkbox
} from '@material-ui/core';

const IsolationPlan = ({ classes, toggleAccomodations, toggleAble, saveIsolationPlan, formValues, isDisabled, handleChange }) => {
  const { isolationPlan, accomodations, ableToIsolate, supplies, transportation } = formValues;
  const updateIsolationPlan = (e) => {
    saveIsolationPlan(e.target.name, e.target.value)
  }
  const computeRadioValue = (val) => val === null ? null : val ? "yes" : "no"
  const updateTransportation = ({ target: { name, checked }}) => {
    console.log(`${name} ${checked}`);
    const updatedTransportationArray = transportation.indexOf(name) === -1 ? [...transportation, name] : transportation.filter(t => t !== name);
    console.dir(updatedTransportationArray)
    handleChange({ target: { name: "transportation", value: updatedTransportationArray }});
  }
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
              onChange={updateIsolationPlan}
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
                onChange={updateIsolationPlan}
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
                onChange={updateIsolationPlan}
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
              <RadioGroup
                row
                aria-label="able to isolate from immuno compromiseed"
                name="ableToIsolate"
                value={computeRadioValue(ableToIsolate === null ? ableToIsolate : !ableToIsolate)}
                onChange={(event) => toggleAble(event.target.value === "no")}>
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Box>
          <Typography variant="subtitle1" style={{paddingTop: "0.5rem"}}>
            * Are you able to make the necessary arrangements for your self-isolation period? (e.g. food, medication, child care, cleaning supplies, pet care).
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              row
              aria-label="supplies"
              name="supplies"
              value={computeRadioValue(supplies)}
              onChange={(event) => handleChange({ target: { name: "supplies", value: event.target.value === "yes" }})}>
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box marginTop="0.75rem">
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">*  What form of transportation will you take to your self-isolation location?</FormLabel>
            <FormGroup row>
              <FormControlLabel
                control={<Checkbox checked={transportation.includes('personal')} onChange={updateTransportation} name="personal" />}
                label="Personal vehicle"
              />
              <FormControlLabel
                control={<Checkbox checked={transportation.includes('public')} onChange={updateTransportation} name="public" />}
                label="Public transportation"
              />
              <FormControlLabel
                control={<Checkbox checked={transportation.includes('taxi')} onChange={updateTransportation} name="taxi" />}
                label="Taxi or ride share"
              />
            </FormGroup>
          </FormControl>
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
