import React from 'react';
import MomentUtils from '@date-io/moment';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Select,
  InputLabel,
  MenuItem
} from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import Copy from '../constants/copy';

const Personal = ({ classes, saveInfo, formValues, isDisabled }) => {
  const handleChange = (event) => saveInfo(event);
  const handleDateChange = (date) => {
    saveInfo({ target: {
      name: 'dob',
      value: date ? date.format('YYYY/MM/DD') : ''
    }})
  }
  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Box padding="1rem">
          <Typography className={classes.cardTitle} variant="h6">
            Primary Contact Information
            <hr className={classes.hr} />
          </Typography>
        </Box>
      </Grid>

      <Grid container>
        {/* FIRSTNAME */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="firstName">* First name (primary contact)</InputLabel>
            <TextField
              id="firstName"
              className={classes.textField}
              name="firstName"
              value={formValues.firstName}
              variant="filled"
              onChange={handleChange}
              fullWidth

            />
          </Box>
        </Grid>
        {/* LASTNAME */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="lastName">* Last name (primary contact)</InputLabel>
            <TextField
              id="lastName"
              className={classes.textField}
              name="lastName"
              value={formValues.lastName}
              variant="filled"
              onChange={handleChange}
              fullWidth
              required
            />
          </Box>
        </Grid>
        {/* DOB */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <InputLabel htmlFor="dob">* Date of birth (yyyy/mm/dd)</InputLabel>
              <KeyboardDatePicker
                format="YYYY/MM/DD"
                className={classes.select}
                id="dob"
                openTo="year"
                variant="filled"
                disableFuture
                fullWidth
                onChange={handleDateChange}
                inputVariant="filled"
                disabled={isDisabled}
                required
                value={formValues.dob || ''}
                KeyboardButtonProps={{ 'aria-label': 'change date' }}
              />
            </MuiPickersUtilsProvider>

          </Box>
        </Grid>

        {/* TELEPHONE */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="telephone">* Phone number</InputLabel>
            {/* TODO input type tel auto formatting! */}
            <TextField
              id="telephone"
              className={classes.textField}
              name="telephone"
              value={formValues.telephone}
              variant="filled"
              required
              onChange={handleChange}
              fullWidth
              inputProps={{ type: 'tel', pattern: 'tel' }}
            />
          </Box>
        </Grid>
        {/* EMAIL */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="email">Email (optional)</InputLabel>
            {/* Validate and approve when email */}
            <TextField
              id="email"
              className={classes.textField}
              name="email"
              value={formValues.email}
              variant="filled"
              onChange={handleChange}
              fullWidth
              inputProps={{ type: 'email' }}
            />
          </Box>
        </Grid>
        {/* ADDRESS */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="address">* Home address</InputLabel>
            <TextField
              id="address"
              className={classes.textField}
              name="address"
              value={formValues.address}
              variant="filled"
              onChange={handleChange}
              fullWidth
              required
            />
          </Box>
        </Grid>
        {/* CITY */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="city">* City</InputLabel>
            <TextField
              id="city"
              className={classes.textField}
              name="city"
              value={formValues.city}
              variant="filled"
              onChange={handleChange}
              fullWidth
              required
            />
          </Box>
        </Grid>
        {/* PROVINCE */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="provSelect">* Province / Territory</InputLabel>
            <Select
              id="provSelect"
              className={classes.select}
              name="province"
              value={formValues.province || ""}
              label="Province"
              variant="filled"
              onChange={handleChange}
              fullWidth
              displayEmpty
              inputProps={{disabled: isDisabled}}
            >
              <MenuItem value="" disabled>Please Select</MenuItem>
              {Copy.provinces.map((prov) => <MenuItem key={prov} value={prov}>{prov}</MenuItem>)}
            </Select>
          </Box>
        </Grid>
        {/* POSTAL CODE */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="postalCode">* Postal Code</InputLabel>
            {/* TODO format as a postal code */}
            <TextField
              id="postalCode"
              className={classes.textField}
              name="postalCode"
              value={formValues.postalCode}
              variant="filled"
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ maxLength: 6 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Personal;
