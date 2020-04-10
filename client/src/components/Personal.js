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
      value: date.format('YYYY/MM/DD')
    }})
  }
  const computeRadioValue = (val) => val === null ? null : val ? "yes" : "no"
  const provs = ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Québec', 'Saskatchewan', 'Yukon' ]
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
                value={formValues.dob || '01/01/1990'}
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
        {/* REACH */}
        {/* <Grid item xs={12}>
          <Box padding="1rem">
            <InputLabel htmlFor="reachSelect">What is the best method to reach you?</InputLabel>
            <Select
          id="reachSelect"
          className={classes.select}
          name="reach"
          value={formValues.reach || ""}
          variant="filled"
          onChange={handleChange}
          fullWidth
          displayEmpty
          inputProps={{disabled: isDisabled}}
            >
          <MenuItem value="" disabled>Please Select</MenuItem>
          <MenuItem key="reachPhone" value="phone">Phone</MenuItem>
          <MenuItem key="reachEmail" value="email">Email</MenuItem>
            </Select>
          </Box>
        </Grid> */}
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
              {provs.map((prov) => <MenuItem key={prov} value={prov}>{prov}</MenuItem>)}
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

        {/* ESSENTIAL */}

        <Grid item xs={12}>
          <Box padding="1rem">
            <Typography className={classes.cardTitle} variant="h6">
              Essential Worker Status
              <hr className={classes.hr} />
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box padding="1rem" paddingBottom="0">
            <FormControl component="fieldset">
              <FormLabel className={classes.formLabel} component="legend">
                {/* <a href="https://www2.gov.bc.ca/gov/content?id=0940F66B87B641909DFDE590435ABD81" target="_blank" rel="noreferrer noopener"> */}
                Are you an essential worker?
              </FormLabel>
              <RadioGroup
                row
                aria-label="Are you an essential worker?"
                name="essential"
                value={computeRadioValue(formValues.essentialWorker)}
                onChange={(event) => handleChange({ target: { name: "essentialWorker", value: event.target.value === "yes" }})}>
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
          <Box width="100%" padding="1rem 1rem 2rem 1rem">
            <InputLabel htmlFor="role">
              If Yes, please describe your employment/role
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
        {/* HCN
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
        </Grid> */}
      </Grid>
    </Grid>
  )
}

export default Personal;
