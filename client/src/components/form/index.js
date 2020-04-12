import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import moment from 'moment';
import { Formik, Form } from 'formik';
import { useHistory } from 'react-router-dom';

import { Routes } from '../../constants';
import { dateToString } from '../../utils';
import { FormSchema } from '../../validation-schemas';

import { Card } from '../generic';
import { SubmissionInfo } from './SubmissionInfo';
import { Summary } from './Summary';
import { PrimaryContactInformation } from './PrimaryContactInformation';
import { TravelInformation } from './TravelInformation';
import { SelfIsolationPlan } from './SelfIsolationPlan';
import { Certify } from './Certify';
import { Contact } from './Contact';

const handleSubmission = (submission) => {
  const modified = { ...submission };

  if (!modified.isolationPlan.type && !modified.isolationPlan.city && !modified.isolationPlan.address) {
    modified.isolationPlan = null;
  }

  if (!modified.includeAdditionalTravellers) {
    modified.additionalTravellers = [];
  }

  delete modified.numberOfAdditionalTravellers;

  return modified;
};

export default ({ initialValues = null, isDisabled, confirmationNumber = null, isPdf = false }) => {
  const history = useHistory();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const formValues = initialValues ? initialValues : {

    // Primary contact information
    firstName: '',
    lastName: '',
    dob: '',
    telephone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',

    // Travel information
    includeAdditionalTravellers: null,
    numberOfAdditionalTravellers: 0,
    additionalTravellers: [],
    arrival: {
      date: dateToString(moment.now()),
      by: '',
      from: '',
      flight: '',
    },

    // Self isolation plan
    accomodations: null,
    isolationPlan: {
      type: '',
      city: '',
      address: '',
    },
    ableToIsolate: null,
    supplies: null,
    transportation: [],
    certified: false,
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);

    const modifiedValues = handleSubmission(values);
    const response = await fetch('/api/v1/form', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-type': 'application/json' },
      body: JSON.stringify({ ...modifiedValues }),
    });
    if (response.ok) {
      const { id, healthStatus, isolationPlanStatus, error, accessToken } = await response.json();
      if (error) {
        setSubmitError(error.message || 'Failed to submit this form');
      } else {
        history.push(Routes.Confirmation, { id, healthStatus, isolationPlanStatus, accessToken });
        return;
      }
    } else {
      setSubmitError(response.error || response.statusText || 'Server error');
    }
    setSubmitLoading(false);
  };

  return (
    <Grid item xs={12} sm={isDisabled ? 12 : 11} md={isDisabled ? 12 : 10} lg={isDisabled ? 12 : 8} xl={isDisabled ? 12 : 6}>

      {isDisabled && (
        <Box pl={2} pr={2} pb={3}>
          <SubmissionInfo isolationPlanStatus={formValues.isolationPlanStatus} id={confirmationNumber} isPdf={isPdf} />
        </Box>
      )}

      {!isDisabled && (
        <Box pt={4} pb={4} pl={2} pr={2}>
          <Summary />
        </Box>
      )}

      <Box pl={2} pr={2}>
        <Card>
          <Formik
            initialValues={formValues}
            validationSchema={FormSchema}
            onSubmit={handleSubmit}
          >
            <Form>
              <Grid container spacing={2}>
                <PrimaryContactInformation isDisabled={isDisabled} />
                <TravelInformation isDisabled={isDisabled} />
                <SelfIsolationPlan isDisabled={isDisabled} />
                {!isDisabled && <Certify submitLoading={submitLoading} submitError={submitError} />}
              </Grid>
            </Form>
          </Formik>
        </Card>
      </Box>

      {(!isPdf && !isDisabled) && (
        <Box pt={4} pb={4} pl={2} pr={2}>
          <Contact />
        </Box>
      )}
    </Grid>
  );
};
