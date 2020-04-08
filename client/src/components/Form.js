import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Personal from './Personal';
import AdditionalTravelers from './AdditionalTravelers';
import Arrival from './Arrival';
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

// TODO: Implement `isDisabled` for all form fields
const Form = ({ initialValues, isDisabled, id = null }) => {

  const classes = useStyles();
  const history = useHistory();

  const [formValues, setFormValues] = useState(initialValues ? initialValues : {
    firstName: '',
    lastName: '',
    telephone: '',
    mobile: '',
    reach: '',
    email: '',
    essentialWorker: null,
    role: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    healthCareNumber: '',
    dob: '',
    householdTravelers: '',
    additionalTravelers: [],
    arrival: {
      date: '',
      by: '',
      flightNumber: '',
      city: '',
      country: ''
    },
    locations: [],
    symptoms: {
      fever: false,
      cough: false,
      breathing: false,
      other: false,
      none: false,
      otherSymptoms: ''
    },
    riskGroups: {
      overSixty: false,
      cardiovascular: false,
      lung: false,
      diabetes: false,
      immune: false,
      none: false
    },
    isolationPlan: {
      city: '',
      address: '',
      type: '',
      withProfessional: null,
      independentTransport: null,
      supplies: null,
      suppliesSource: null,
      support: null,
      outdoors: null,
    }
  });
  const [certified, toggleCertified] = useState(false);
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues(prevState => ({ ...prevState, [name]: value }));
  };

  const saveAdditionalTravellers = (additionalTravellers) => setFormValues(prevState => ({ ...prevState, additionalTravellers }))
  const saveArrivalDetails = (name, value) => {
    setFormValues(prevState => ({ ...prevState, arrival: { ...prevState.arrival, [name]: value } }));
  };
  const saveSymptoms = (name, value) => {
    setFormValues(prevState => ({ ...prevState, symptoms: { ...prevState.symptoms, [name]: value } }));
  };
  const saveRiskGroups = (name, value) => {
    setFormValues(prevState => ({ ...prevState, riskGroups: { ...prevState.riskGroups, [name]: value } }));
  };
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
      const { id, healthStatus, isolationPlanStatus, error, accessToken } = await response.json();
      if (error) {
        // the definition of elegance
        alert(error.message);
      } else {
        history.push(`/confirmation`, { id, healthStatus, isolationPlanStatus, accessToken });
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

      {isDisabled && (<SubmissionInfo id={id} />)}

      {!isDisabled && (
        <Box padding='2rem'>
          <Typography variant="h5" gutterBottom>
            Travel Assesment Form
          </Typography>
          <Typography variant="body1" gutterBottom>
            BC has declared a state of emergency. To ensure the safety of all British Columbians, you are being asked to delcare your journey details and plans to self isolate.
          </Typography>
        </Box>
      )}

      <Card variant="outlined" className={classes.card}>
        <CardContent>
          <Grid container>

            <Personal isDisabled={isDisabled} classes={classes} saveInfo={handleChange} formValues={formValues} />
            <AdditionalTravelers isDisabled={isDisabled} classes={classes} saveInfo={saveAdditionalTravellers} formValues={formValues} />
            <Arrival isDisabled={isDisabled} classes={classes} saveInfo={saveArrivalDetails} formValues={formValues} />
            <Symptoms isDisabled={isDisabled} classes={classes} saveSymptoms={saveSymptoms} saveRiskGroups={saveRiskGroups} symptoms={formValues.symptoms} riskGroups={formValues.riskGroups} />
            <IsolationPlan isDisabled={isDisabled} classes={classes} formValues={formValues} saveIsolationPlan={saveIsolationPlan} />
            {!isDisabled && <Certify toggleCertified={toggleCertified} certified={certified} />}

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
