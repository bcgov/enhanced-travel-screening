import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Routes from '../constants/routes';
import Personal from './Personal';
import AdditionalTravelers from './AdditionalTravelers';
import Arrival from './Arrival';
import Disclaimer from './Disclaimer';
import IsolationPlan from './IsolationPlan';
import Certify from './Certify';
import SubmissionInfo from './SubmissionInfo';
import { Contact } from './Contact';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  primaryText: {
    color: '#002C71'
  },
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
  mt1: {
    marginTop: '1rem',
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
  contactButton: {
    minHeight: '42px',
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

  const [loading, toggleLoading] = useState(false);
  const [error, setError] = useState(false);

  const today = new Date().toLocaleDateString('fr-CA').replace('-', '/').replace('-', '/');

  const [formValues, setFormValues] = useState(initialValues ? initialValues : {
    firstName: '',
    lastName: '',
    telephone: '',
    reach: '',
    email: '',
    role: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    dob: '1990/01/01',
    includeAdditionalTravellers: null,
    additionalTravelers: [],
    arrival: {
      date: today,
      by: '',
      from: '',
      flight: ''
    },
    symptoms: null,
    accomodations: null,
    supplies: null,
    ableToIsolate: null,
    accomodationAssistance: null,
    transportation: [],
    isolationPlan: {
      city: '',
      address: '',
      type: '',
    },
    certified: false
  });
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues(prevState => ({ ...prevState, [name]: value }));
  };
  const toggleAdditionalTravellers = (bool) => setFormValues(prevState => ({ ...prevState, includeAdditionalTravellers: bool }))
  const saveAdditionalTravellers = (additionalTravellers) => setFormValues(prevState => ({ ...prevState, additionalTravellers }))
  const saveArrivalDetails = (name, value) => {
    setFormValues(prevState => ({ ...prevState, arrival: { ...prevState.arrival, [name]: value } }));
  };
  // const toggleSymptoms = (bool) => setFormValues(prevState => ({ ...prevState, symptoms: bool }))
  const toggleAccomodations = (bool) => setFormValues(prevState => ({ ...prevState, accomodations: bool }))
  const toggleAble = (bool) => setFormValues(prevState => ({ ...prevState, ableToIsolate: bool }))
  const toggleCertified = (bool) => setFormValues(prevState => ({ ...prevState, certified: bool }));
  const saveIsolationPlan = (name, value) => {
    setFormValues(prevState => ({ ...prevState, isolationPlan: { ...prevState.isolationPlan, [name]: value } }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    toggleLoading(true);
    try {
      const response = await fetch('/api/v1/form', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        body: JSON.stringify(formValues)
      });
      if (response.ok) {
        const { id, healthStatus, isolationPlanStatus, error, accessToken } = await response.json();
        if (error) {
          throw new Error(error.message || 'Failed to submit this form');
        } else {
          history.push(Routes.Confirmation, { id, healthStatus, isolationPlanStatus, accessToken });
        }
      } else {
        throw new Error(response.error || response.statusText || 'Server error');
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      toggleLoading(false);
    }
  };

  const canSubmitForm = () => formValues.certified;

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

      {isDisabled && (<SubmissionInfo isolationPlanStatus={formValues.isolationPlanStatus} id={confirmationNumber} isPdf={isPdf} />)}

      {!isDisabled && (
        <Box padding='2rem 2rem 1rem 2rem'>
          <Typography variant="h5" gutterBottom>
            Self-Isolation Plan
          </Typography>
          <Typography variant="body1" gutterBottom>
            B.C. has declared a state of emergency. To ensure the safety of all British Columbians you are being asked to declare your journey details and how you plan to self isolate. Please complete the form below.
          </Typography>
          <Typography variant="body1" gutterBottom className={classes.mt1}>
            Need help with your self isolation plan? {window.innerWidth < 600 && <br />}<a className={classes.isPrimary} href="https://www2.gov.bc.ca/gov/content/home/get-help-with-government-services ">Talk to a Service BC agent</a>
          </Typography>
          <Typography variant="body1" gutterBottom className={classes.mt1}>
            Download a <a className={classes.isPrimary} href="https://www2.gov.bc.ca/assets/gov/health-safety/support_for_travellers_print.pdf">PDF version of this form</a>
          </Typography>
        </Box>
      )}

      <Card variant="outlined" className={classes.card}>
        <CardContent>
          <Grid container>
            <Personal isDisabled={isDisabled} classes={classes} saveInfo={handleChange} formValues={formValues} />
            <AdditionalTravelers isDisabled={isDisabled} toggleAdditionalTravellers={toggleAdditionalTravellers} classes={classes} saveInfo={saveAdditionalTravellers} formValues={formValues} />
            <Arrival isDisabled={isDisabled} classes={classes} saveInfo={saveArrivalDetails} formValues={formValues} />
            {/* <Symptoms isDisabled={isDisabled} classes={classes} toggleSymptoms={toggleSymptoms} symptoms={formValues.symptoms}/> */}
            <IsolationPlan isDisabled={isDisabled} handleChange={handleChange} classes={classes} toggleAble={toggleAble} formValues={formValues} saveIsolationPlan={saveIsolationPlan} toggleAccomodations={toggleAccomodations} />
            {!isDisabled && <Certify toggleCertified={toggleCertified} certified={formValues.certified} />}

            {error && (
              <Grid alignContent="center" justify="center" alignItems="center" item xs={12} container>
                <Grid item xs={12}>
                  <Box padding="1rem">
                    <Typography variant="body1" color="error">
                      {error}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
            {!isDisabled && (
              <Grid alignContent="center" justify="center" alignItems="center" item xs={12} container>
                <Box padding="1rem">
                  <Disclaimer />
                </Box>
                <Grid item xs={8}>
                  <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={!canSubmitForm() || loading}
                    fullWidth
                  >
                    {loading ? 'Processing...' : 'Submit'}
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      <Box padding="1rem">
        <Contact classes={classes} />
      </Box>
    </Grid>
  );
};

export default Form;
