import React from 'react';
import MomentUtils from '@date-io/moment';
import Box from '@material-ui/core/Box';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

const Arrival = ({ classes, saveInfo, formValues, isDisabled }) => {
  const { arrival } = formValues;
  const handleDateChange = (date, index) => {
    saveInfo('date', date.format('MM/DD/YYYY'))
  }
  return (
    <Grid container>
      <Grid item xs={12}>
        <Box padding="1rem">
          <Typography className={classes.cardTitle} variant="h6">
            Arrival Information
          </Typography>
        </Box>
      </Grid>
      {/* ARRIVAL INFO */}
      {/* DATE */}
      <Grid item xs={12} md={4}>
        <Box padding="1rem">
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <InputLabel htmlFor="arrival_date">Arrival Date</InputLabel>
            <KeyboardDatePicker
              format="MM/DD/YYYY"
              id="arrival_date"
              variant="filled"
              fullWidth
              onChange={handleDateChange}
              inputVariant="filled"
              style={{marginTop: '0.25rem'}}
              value={arrival.date || new Date()}
              KeyboardButtonProps={{ 'aria-label': 'change date' }}
            />
          </MuiPickersUtilsProvider>
        </Box>
      </Grid>
      {/* ARRIVAL BY */}
      <Grid item xs={12} md={4}>
        <Box padding="1rem">
          <InputLabel htmlFor="arrival_by">Arrival By</InputLabel>

          <Select
            id="arrival_by"
            className={classes.select}
            name="by"
            value={arrival.by}
            variant="filled"
            onChange={(e) => saveInfo(e.target.name, e.target.value)}
            fullWidth
            displayEmpty
            inputProps={{disabled: isDisabled}}
          >
            <MenuItem value="" disabled>Select Arrival Type</MenuItem>
            <MenuItem key="arrivalAir" value="air">Air</MenuItem>
            <MenuItem key="arrivalLand" value="land">Land</MenuItem>
            <MenuItem key="arrivalSea" value="sea">Sea</MenuItem>
          </Select>
        </Box>
      </Grid>
      {/* CITY */}
      <Grid item xs={12} md={4}>
        <Box padding="1rem">
          <InputLabel htmlFor="arrival_city">Arrival City</InputLabel>
          <TextField
            id="arrival_city"
            className={classes.textField}
            name="city"
            value={arrival.city}
            onChange={(e) => saveInfo(e.target.name, e.target.value)}
            variant="filled"
            fullWidth
          />
        </Box>
      </Grid>
      {/* COUNTRY */}
      <Grid item xs={12} md={4}>
        <Box padding="1rem">
          <InputLabel htmlFor="arrival_country">Arrival Country</InputLabel>
          <TextField
            id="arrival_country"
            className={classes.textField}
            name="country"
            value={arrival.country}
            onChange={(e) => saveInfo(e.target.name, e.target.value)}
            variant="filled"
            fullWidth
          />
        </Box>
      </Grid>
    </Grid>
  )
}

export default Arrival;
