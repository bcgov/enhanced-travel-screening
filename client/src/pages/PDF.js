import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Form from '../components/Form';

const SubmissionView = ({ match: { params }}) => {
  const [initialValues, setInitialValues] = useState(null);
  const [loading, toggleLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // const jwt = window.localStorage.getItem('jwt');
      const response = await fetch(`/api/v1/form/pdf/${params.id}`, {
        headers: { 'Accept': 'application/json', 'Content-type': 'application/json' },
        method: 'GET',
      });
      if (response.ok) {
        const data = await response.json();
        console.dir(data);
        setInitialValues(data);
        toggleLoading(false);
      }
    })();
  }, [params.id]);

  return (
     <Grid style={{ height: '100%', overflowY: 'auto'}} item xs={12}>
       {!loading && <Form initialValues={initialValues} isDisabled />}
     </Grid>
  );
};

export default SubmissionView;
