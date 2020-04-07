import React, { useState } from 'react';
import Personal from '../components/Personal';
import AdditionalTravelers from '../components/AdditionalTravelers';
import Symptoms from '../components/Symptoms';
import IsolationPlan from '../components/IsolationPlan';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    height: 'calc(100vh - 82px)',
    backgroundColor: '#f5f5f5',
    color: '#333333',
    fontFamily: 'Lato',
    fontSize: '14px',
    letterSpacing: '-0.05px',
    lineHeight: '18px',
  },
  card: {
    padding: theme.spacing(4, 2),
    margin: theme.spacing(2),
  },
  cardTitle: {
    height: '24px',
    color: '#000000',
    fontSize: '20px',
    fontWeight: 500,
    letterSpacing: 0,
    lineHeight: '24px',
  },
  textField: {
    '& > .MuiOutlinedInput-root': {
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0',
    },
    marginTop: '0.25rem'
  },
  select: {
    marginTop: '0.25rem',
  },
  stretch: {
    width: '100%'
  },
  formLabel: {
    color: 'black'
  },
  inlineFormControl: {
    display: 'inline'
  },
  button: {
    minHeight: '54px',
    height: '100%',
    borderTopLeftRadius: '0',
    borderBottomLeftRadius: '0',
  },
  hr: {
    height: '3px',
    backgroundColor: '#E2A014',
    color: '#E2A014',
    borderStyle: 'solid',
  }
}));


const Form = () => {

  const classes = useStyles();

  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    telephone: '',
    mobile: '',
    reach: '',
    email: '',
    essentialWorker: '',
    role: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    healthCareNumber: '',
    dob: '',
    householdTravelers: '',
    additionalTravelers: [],
    locations: []
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(`summit event`)
    const response = await fetch('/api/v1/form', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json'
      },
      body: JSON.stringify(formValues)
    })
    console.log(response.ok)
    console.dir(response)
    if (response.ok) {
      const data = await response.json();
      console.dir(data)
    } else {
      console.error(response)
    }
  }

  return (
    <Grid className={classes.root} container justify="center" alignItems="center">
      <Grid item xs={12} sm={12} md={10} lg={8} xl={8}>
        <Box padding='2rem'>
          <Typography variant="h5" gutterBottom>
            Travel Assesment Form
          </Typography>
          <Typography variant="body1" gutterBottom>
            BC has declared a state of emergency. To ensure the safety of all British Columbians, you are being asked to delcare your journey details and plans to self isolate.
          </Typography>

        </Box>

        <Card variant="outlined" className={classes.card}>
          <CardContent>
            <Grid container>

              <Personal classes={classes} saveInfo={handleChange} formValues={formValues} />

              <AdditionalTravelers classes={classes} saveInfo={handleChange} formValues={formValues} />

              <Symptoms classes={classes} />

              <IsolationPlan classes={classes} />


              <Grid alignContent="center" justify="center" alignItems="center" item xs={12} container>
                <Grid item xs={4}>
                  <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    fullWidth
                  >
                    Submit Form
                  </Button>
                </Grid>
              </Grid>
            </Grid>

          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Form;
