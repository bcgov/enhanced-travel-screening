import React, { useState } from 'react';
import MomentUtils from '@date-io/moment';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
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

const AdditionalTravellers = ({ classes, saveInfo, formValues }) => {
  const [additionalTravellers, setAdditionalTravellers] = useState([]);
  const [numberAdditionalTravellers, setNumberAdditionalTravellers] = useState(0);
  const blankTraveller = (index) => ({
    firstName: '',
    lastName: '',
    dob: '',
    essentialWorker: '',
    role: '',
    index
  })
  const handleDateChange = (date, index) => {
    handleChange({ name: 'dob', value: date.format('MM/DD/YYYY') }, index)
  }
  const handleChange = ({ name, value }, index) => {
    let thisTraveller = additionalTravellers[index];
    thisTraveller[name] = value;
    let updatedList = [...additionalTravellers]
    updatedList[index] = thisTraveller
    setAdditionalTravellers([...updatedList])
    saveInfo([...updatedList])
  }
  const changeNumberOfTravellers = (number) => {
    setNumberAdditionalTravellers(number)
    let additional = [];
    for (let i = 0; i < number; i++) {
      additional.push(blankTraveller(i))
    }
    setAdditionalTravellers(additional)
    saveInfo(additional)
  }
  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Box padding="1rem">
          <Typography className={classes.cardTitle} variant="h6">
            Additional Travellers
            <hr className={classes.hr} />
          </Typography>
        </Box>
      </Grid>
      {/* PROVINCE */}
      <Grid item xs={12} md={6}>
        <Box padding="1rem">
          <InputLabel htmlFor="numberTravellers">Number of household travellers?</InputLabel>
          <Select
            id="numberTravellers"
            className={classes.select}
            name="numberAdditionalTravellers"
            value={numberAdditionalTravellers}
            variant="filled"
            onChange={(e) => changeNumberOfTravellers(e.target.value)}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>Select...</MenuItem>
            <MenuItem value={0}>0</MenuItem>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
          </Select>
        </Box>
      </Grid>

      {additionalTravellers.map(traveller => traveller.index <= numberAdditionalTravellers ? (
        <Card key={traveller.index} variant="outlined" className={classes.card}>
          <CardContent>
            <Grid container>
              <Box padding="1rem" paddingTop="0">
                <Typography variant="h6">
                  Additional Traveller Information
                </Typography>
                <Typography variant="subtitle1">
                  For each traveller, please list their last name, first name and date of birth
                </Typography>
              </Box>
              {/* FIRSTNAME */}
              <Grid item xs={12} md={4}>
                <Box padding="1rem">
                  <InputLabel htmlFor="firstName">First Name</InputLabel>
                  <TextField
                    id="firstName"
                    className={classes.textField}
                    name="firstName"
                    value={traveller.firstName}
                    onChange={(e) => handleChange(e.target, traveller.index)}
                    variant="filled"
                    fullWidth
                  />
                </Box>
              </Grid>
              {/* LASTNAME */}
              <Grid item xs={12} md={4}>
                <Box padding="1rem">
                  <InputLabel htmlFor="lastName">Last Name</InputLabel>
                  <TextField
                    id="lastName"
                    className={classes.textField}
                    name="lastName"
                    value={traveller.lastName}
                    onChange={(e) => handleChange(e.target, traveller.index)}
                    variant="filled"
                    fullWidth
                  />
                </Box>
              </Grid>
              {/* DOB */}
              <Grid item xs={12} md={4}>
                <Box padding="1rem">
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <InputLabel htmlFor="dob">DoB (MM/dd/yyyy)</InputLabel>
                    <KeyboardDatePicker
                      format="MM/DD/YYYY"
                      id="dob"
                      variant="filled"
                      fullWidth
                      onChange={(date) => handleDateChange(date, traveller.index)}
                      inputVariant="filled"
                      value={traveller.dob || '01/01/1990'}
                      KeyboardButtonProps={{ 'aria-label': 'change date' }}
                    />
                  </MuiPickersUtilsProvider>

                </Box>
              </Grid>

              {/* ESSENTIAL */}
              <Grid item xs={12}>
                <Box padding="1rem">
                  <FormControl fullWidth className={classes.inlineFormControl} component="fieldset">
                    <FormLabel className={classes.formLabel} component="legend">
                      <b>
                        Has your employer designated you as an essential worker?
                        <br/>
                        (select no if not applicable)
                      </b>
                    </FormLabel>
                    <RadioGroup
                      row
                      aria-label="essential worker"
                      name="essentialWorker"
                      value={traveller.essentialWorker}
                      onChange={(e) => handleChange(e.target, traveller.index)}
                    >
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
                    name="role"
                    className={`${classes.stretch} ${classes.textField}`}
                    variant="outlined"
                    rows="2"
                    value={traveller.role}
                    onChange={(e) => handleChange(e.target, traveller.index)}
                    multiline
                    fullWidth
                  />
                </Box>
              </Grid>
            </Grid>

          </CardContent>
        </Card>
      ) : null)}

    </Grid>
  )
}

export default AdditionalTravellers;
