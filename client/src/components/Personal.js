import React from 'react';
import MomentUtils from '@date-io/moment';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

const Personal = ({ classes, saveInfo, formValues, isDisabled }) => {
  const handleChange = (event) => saveInfo(event);
  const handleDateChange = (date) => {
    saveInfo({ target: {
      name: 'dob',
      value: date.format('MM/DD/YYYY')
    }})
  }
  const computeRadioValue = (val) => val === null ? null : val ? "yes" : "no"
  const provs = ['ab', 'bc', 'sa', 'ma', 'on', 'nb', 'ns', 'nv', 'pei', 'qc', 'nwt', 'yn' ]
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
            <InputLabel htmlFor="firstName">First Name</InputLabel>
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
            <InputLabel htmlFor="lastName">Last Name</InputLabel>
            <TextField
              id="lastName"
              className={classes.textField}
              name="lastName"
              value={formValues.lastName}
              variant="filled"
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </Grid>
        {/* TELEPHONE */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="telephone">Telephone</InputLabel>
            <TextField
              id="telephone"
              className={classes.textField}
              name="telephone"
              value={formValues.telephone}
              variant="filled"
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </Grid>
        {/* MOBILE */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="mobilePhone">Mobile Phone</InputLabel>
            <TextField
              id="mobilePhone"
              className={classes.textField}
              name="mobile"
              value={formValues.mobile}
              variant="filled"
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </Grid>
        {/* REACH */}
        <Grid item xs={12}>
          <Box padding="1rem">
            <InputLabel htmlFor="reach">If you do not have a mobile phone, how can we best reach you?</InputLabel>
            <TextField
              id="reach"
              className={classes.textField}
              name="reach"
              value={formValues.reach}
              variant="filled"
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </Grid>
        {/* EMAIL */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="email">Email</InputLabel>
            <TextField
              id="email"
              className={classes.textField}
              name="email"
              value={formValues.email}
              variant="filled"
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </Grid>
        {/* ESSENTIAL */}
        <Grid item xs={12}>
          <Box padding="1rem">
            <FormControl component="fieldset">
              <FormLabel className={classes.formLabel} component="legend"><b>Has your employer designated you as an essential worker? (select no if not applicable)</b></FormLabel>
              <RadioGroup
                row
                aria-label="essential worker"
                name="essential"
                value={computeRadioValue(formValues.essentialWorker)}
                onChange={(event) => handleChange({ target: { name: "essentialWorker", value: event.target.value === "yes" }})}>
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
          <Box width="100%" padding="1rem" marginBottom="1rem">
            <InputLabel htmlFor="role">
              Please describe your employment and your role if you selected yes.
            </InputLabel>

            <TextField
              id="role"
              onChange={handleChange}
              name="role"
              className={`${classes.stretch} ${classes.textField}`}
              variant="outlined"
              rows="2"
              multiline
              fullWidth
              disabled={isDisabled}
            />
          </Box>
        </Grid>
        {/* ADDRESS */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="address">Address</InputLabel>
            <TextField
              id="address"
              className={classes.textField}
              name="address"
              value={formValues.address}
              variant="filled"
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </Grid>
        {/* CITY */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="city">City</InputLabel>
            <TextField
              id="city"
              className={classes.textField}
              name="city"
              value={formValues.city}
              variant="filled"
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </Grid>
        {/* PROVINCE */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="provSelect">Province</InputLabel>
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
              {provs.map((prov) => (
                <MenuItem key={prov} value={prov}>{prov.toUpperCase()}</MenuItem>
              ))}

            </Select>
          </Box>
        </Grid>
        {/* POSTAL CODE */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="postalCode">Postal Code</InputLabel>
            <TextField
              id="postalCode"
              className={classes.textField}
              name="postalCode"
              value={formValues.postalCode}
              variant="filled"
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </Grid>
        {/* HCN */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <InputLabel htmlFor="hcn">Health Care Number</InputLabel>
            <TextField
              id="hcn"
              className={classes.textField}
              name="healthCareNumber"
              value={formValues.healthCareNumber}
              variant="filled"
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </Grid>
        {/* DOB */}
        <Grid item xs={12} md={6}>
          <Box padding="1rem">
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <InputLabel htmlFor="dob">Date of Birth (MM/dd/yyyy)</InputLabel>
              <KeyboardDatePicker
                format="MM/DD/YYYY"
                className={classes.select}
                id="dob"
                openTo="year"
                variant="filled"
                fullWidth
                onChange={handleDateChange}
                inputVariant="filled"
                disabled={isDisabled}
                value={formValues.dob || '01/01/1990'}
                KeyboardButtonProps={{ 'aria-label': 'change date' }}
              />
            </MuiPickersUtilsProvider>

          </Box>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Personal;
