import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { Formik, Form } from 'formik';
import { useHistory } from 'react-router-dom';

import { Routes } from '../../constants';

import { Card } from '../generic';
import { SubmissionInfo } from './SubmissionInfo';
import { Summary } from './Summary';
import { Personal } from './Personal';
import { AdditionalTravellers } from './AdditionalTravellers';

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
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    const response = await fetch('/api/v1/form', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json'
      },
      body: JSON.stringify(values)
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

      {isDisabled && (<SubmissionInfo isolationPlanStatus={formValues.isolationPlanStatus} id={confirmationNumber} isPdf={isPdf} />)}
      {!isDisabled && <Summary />}
      <Card>
        {/*TODO: Add validation Schema once complete */}
        <Formik
          initialValues={formValues}
          onSubmit={handleSubmit}
        >
          <Form>
            <Grid container spacing={2}>
              <Personal isDisabled={isDisabled} />
              <AdditionalTravellers isDisabled={isDisabled} />
              {/*<Arrival isDisabled={isDisabled} classes={classes} saveInfo={saveArrivalDetails} formValues={formValues} />*/}
              {/*<IsolationPlan isDisabled={isDisabled} handleChange={handleChange} classes={classes} toggleAble={toggleAble} formValues={formValues} saveIsolationPlan={saveIsolationPlan} toggleAccomodations={toggleAccomodations} />*/}
              {/*{!isDisabled && <Certify toggleCertified={toggleCertified} certified={formValues.certified} />}*/}
            </Grid>
          </Form>
        </Formik>
      </Card>
      {/*{!isDisabled && <Contact />}*/}
    </Grid>
  );
};
