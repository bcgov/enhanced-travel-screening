import Box from '@material-ui/core/Box';
import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { Formik, Form } from 'formik';
import { useHistory } from 'react-router-dom';

import { Routes } from '../../constants';
import { today } from '../../utils';

import { Card } from '../generic';
import { SubmissionInfo } from './SubmissionInfo';
import { Summary } from './Summary';
import { Personal } from './Personal';
import { AdditionalTravellers } from './AdditionalTravellers';
import { Arrival } from './Arrival';
import { IsolationPlan } from './IsolationPlan';
import { Certify } from './Certify';
import { Contact } from './Contact';

export default ({ initialValues = null, isDisabled, confirmationNumber = null, isPdf = false }) => {
  const history = useHistory();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const formValues = initialValues ? initialValues : {
    firstName: '',
    lastName: '',
    dob: '1990/01/01',
    telephone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    includeAdditionalTravellers: null,
    additionalTravelers: [],
    arrival: {
      date: today,
      by: '',
      from: '',
      flight: '',
    },
    accommodations: null,
    isolationPlan: null,
    accommodationAssistance: null,
    supplies: null,
    transportation: ['public'],
    certified: false,
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    const response = await fetch('/api/v1/form', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-type': 'application/json' },
      body: JSON.stringify({ ...values }),
    });
    if (response.ok) {
      const { id, healthStatus, isolationPlanStatus, error, accessToken } = await response.json();
      if (error) {
        setSubmitError(error.message || 'Failed to submit this form');
      } else {
        history.push(Routes.Confirmation, { id, healthStatus, isolationPlanStatus, accessToken });
      }
    } else {
      setSubmitError(response.error || response.statusText || 'Server error');
    }
    setSubmitLoading(false);
  };

  return (
    <Grid item xs={12} sm={12} md={isDisabled ? 12 : 10} lg={isDisabled ? 12 : 8}>

      {isDisabled && (
        <Box pl={2.5} pr={2.5} pb={3}>
          <SubmissionInfo isolationPlanStatus={formValues.isolationPlanStatus} id={confirmationNumber} isPdf={isPdf} />)
        </Box>
      )}

      {!isDisabled && (
        <Box pt={4} pb={4} pl={2.5} pr={2.5}>
          <Summary />
        </Box>
      )}

      <Box pl={2.5} pr={2.5}>
        <Card>
          {/*TODO: Add validation Schema once complete */}
          <Formik
            initialValues={formValues}
            // validationSchema={SubmissionFormSchema}
            onSubmit={handleSubmit}
          >
            <Form>
              <Grid container spacing={2}>
                <Personal isDisabled={isDisabled} />
                <AdditionalTravellers isDisabled={isDisabled} />
                <Arrival isDisabled={isDisabled} />
                <IsolationPlan isDisabled={isDisabled} />
                {!isDisabled && <Certify submitLoading={submitLoading} submitError={submitError} />}
              </Grid>
            </Form>
          </Formik>
        </Card>
      </Box>

      {!isDisabled && (
        <Box pt={4} pb={4} pl={2.5} pr={2.5}>
          <Contact />
        </Box>
      )}
    </Grid>
  );
};
