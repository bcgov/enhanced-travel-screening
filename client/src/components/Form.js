import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Routes from '../constants/routes';
import Personal from './Personal';
import AdditionalTravelers from './AdditionalTravelers';
import Arrival from './Arrival';
import Disclaimer from './Disclaimer';
import Symptoms from './Symptoms';
import IsolationPlan from './IsolationPlan';
import Certify from './Certify';
import SubmissionInfo from './SubmissionInfo';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  card: {
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
    marginTop: '0.25rem',
    maxHeight: '40px'
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
  },
  hr: {
    height: '3px',
    backgroundColor: '#E2A014',
    color: '#E2A014',
    borderStyle: 'solid',
  }
}));

const Form = ({ initialValues, isDisabled, confirmationNumber = null, isPdf = false }) => {

  const classes = useStyles();
  const history = useHistory();

  const [formValues, setFormValues] = useState(initialValues ? initialValues : {
    firstName: '',
    lastName: '',
    telephone: '',
    reach: '',
    email: '',
    essentialWorker: null,
    role: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    dob: '',
    includeAdditionalTravellers: null,
    additionalTravelers: [],
    arrival: {
      date: '',
      by: '',
      city: '',
      country: ''
    },
    symptoms: null,
    accomodations: null,
    isolationPlan: {
      city: '',
      address: '',
      type: '',
      ableToIsolate: null,
      supplies: null,
      transportation: ''
    }
  });
  const [certified, toggleCertified] = useState(false);
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues(prevState => ({ ...prevState, [name]: value }));
  };
  const toggleAdditionalTravellers = (bool) => setFormValues(prevState => ({ ...prevState, includeAdditionalTravellers: bool }))
  const saveAdditionalTravellers = (additionalTravellers) => setFormValues(prevState => ({ ...prevState, additionalTravellers }))
  const saveArrivalDetails = (name, value) => {
    setFormValues(prevState => ({ ...prevState, arrival: { ...prevState.arrival, [name]: value } }));
  };
  const toggleSymptoms = (bool) => setFormValues(prevState => ({ ...prevState, symptoms: bool }))
  const toggleAccomodations = (bool) => setFormValues(prevState => ({ ...prevState, accomodations: bool }))
  const saveIsolationPlan = (name, value) => {
    setFormValues(prevState => ({ ...prevState, isolationPlan: { ...prevState.isolationPlan, [name]: value } }));
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
    });
    if (response.ok) {
      const { id, error, accessToken } = await response.json();
      if (error) {
        // the definition of elegance
        alert(error.message);
      } else {
        history.push(Routes.Confirmation, { id, accessToken });
      }
    } else {
      console.error(response);
    }
  };

  const canSubmitForm = () => {
    return certified
  };

  useEffect(() => {
    if (isDisabled) {
      const inputs = document.getElementsByTagName('input');
      for (let input of inputs) {
        input.setAttribute('disabled', true)
      }
    }
  }, [isDisabled])

  return (
    <Grid item xs={12} sm={12} md={isDisabled ? 12 : 10} lg={isDisabled ? 12 : 8} xl={isDisabled ? 12 : 8}>

      {isDisabled && (<SubmissionInfo id={confirmationNumber} isPdf={isPdf} />)}

      {!isDisabled && (
        <Box padding='2rem'>
          <Typography variant="h5" gutterBottom>
            Self-Isolation Plan
          </Typography>
          <Typography variant="body1" gutterBottom>
            B.C. has declared a state of emergency. To ensure the safety of all British Columbians you are being asked to declare your journey details and how you plan to self isolate. Please complete the form below.
          </Typography>
        </Box>
      )}

      <Card variant="outlined" className={classes.card}>
        <CardContent>
          <Grid container>
            <Disclaimer />
            <Personal isDisabled={isDisabled} classes={classes} saveInfo={handleChange} formValues={formValues} />
            <AdditionalTravelers isDisabled={isDisabled} toggleAdditionalTravellers={toggleAdditionalTravellers} classes={classes} saveInfo={saveAdditionalTravellers} formValues={formValues} />
            <Arrival isDisabled={isDisabled} classes={classes} saveInfo={saveArrivalDetails} formValues={formValues} />
            <Symptoms isDisabled={isDisabled} classes={classes} toggleSymptoms={toggleSymptoms} symptoms={formValues.symptoms}/>
            <IsolationPlan isDisabled={isDisabled} classes={classes} formValues={formValues} saveIsolationPlan={saveIsolationPlan} toggleAccomodations={toggleAccomodations} accomodations={formValues.accomodations}/>
            {!isDisabled && <Certify firstName={formValues.firstName} lastName={formValues.lastName} toggleCertified={toggleCertified} certified={certified} />}

            {!isDisabled && (
              <Grid alignContent="center" justify="center" alignItems="center" item xs={12} container>
                <Grid item xs={4}>
                  <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!canSubmitForm()}
                    fullWidth
                  >
                    Submit Form
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>

        </CardContent>
      </Card>
    </Grid>
  );
};

export default Form;
