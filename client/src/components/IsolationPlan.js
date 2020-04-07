import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

const IsolationPlan = ({ classes }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [mobile, setMobile] = useState('');
  const [reach, setReach] = useState('');
  const [email, setEmail] = useState('');
  const [essentialWorker, toggleEssential] = useState();
  const [role, setRole] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [postal, setPostal] = useState('');
  const [healthCareNumber, setHealthCareNumber] = useState('');
  const [dob, setDob] = useState('');
  const [householdTravelers, setHouseholdTravelers] = useState('');

  return (
    <Box margin="1rem 0">
      <Grid item xs={12}>
        <Typography className={classes.cardTitle} variant="h6">
          Isolation Plan
        </Typography>
      </Grid>
    </Box>
  )
}

export default IsolationPlan;
