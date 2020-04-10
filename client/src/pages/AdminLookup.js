import React from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { Formik, Form, Field } from 'formik';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import { Routes } from '../constants';
import { LookupSchema } from '../validation-schemas';

import { Page, Card, Button } from '../components/generic';
import { RenderTextField } from '../components/fields';

const useStyles = makeStyles((theme) => ({
  confirmationNumber: {
    '& > .MuiOutlinedInput-root': {
      height: '52px',
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0',
    },
  },
  viewSubmission: {
    borderTopLeftRadius: '0',
    borderBottomLeftRadius: '0',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(2),
    },
  },
}));

const AdminLookup = () => {
  const classes = useStyles();
  const history = useHistory();
  const initialValues = {
    confirmationNumber: '',
  };

  const handleSubmit = (values) => {
    history.push(Routes.LookupResults.dynamicRoute(values.confirmationNumber));
  };

  return (
    <Page>
      <Grid container alignItems="center" justify="center">
        <Grid item xs={12} sm={10} md={8} lg={6} xl={4}>
          <Box m={2.5}>
            <Card title="Submission Lookup">
              <Formik
                initialValues={initialValues}
                validationSchema={LookupSchema}
                onSubmit={handleSubmit}
              >
                <Form>
                  <Grid container>

                    {/** Confirmation Number */}
                    <Grid item xs={12} sm={7} md={8}>
                      <Field
                        className={classes.confirmationNumber}
                        name="confirmationNumber"
                        component={RenderTextField}
                        variant="outlined"
                        placeholder="Enter Confirmation Number eg: BC12345"
                      />
                    </Grid>

                    {/** Submit */}
                    <Grid item xs={12} sm={5} md={4}>
                      <Button
                        className={classes.viewSubmission}
                        type="submit"
                        text="View Submission"
                      />
                    </Grid>
                  </Grid>
                </Form>
              </Formik>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Page>
  );
};

export default AdminLookup;
