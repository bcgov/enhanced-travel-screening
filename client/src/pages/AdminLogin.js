import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Formik, Form, Field } from 'formik';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';

import Routes from '../constants/routes';

import Page from '../components/Page';

const useStyles = makeStyles((theme) => ({
  card: {
    border: '2px solid #D7D7D7',
    padding: theme.spacing(4, 2),
    margin: theme.spacing(2),
    borderRadius: '8px',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitBtn: {
    height: '54px',
  },
}));

// TODO: Add `username` to validation once backend work complete.
const LoginSchema = Yup.object().shape({
  // username: Yup.string()
  //   .email('Invalid email')
  //   .required('Required'),
  password: Yup.string()
    .required('Required'),
});

const AdminLogin = () => {
  const history = useHistory();
  const classes = useStyles();
  const [submitError, setSubmitError] = useState(null);
  const initialValues = {
    username: '',
    password: '',
  };

  const handleSubmit = async (values) => {
    const response = await fetch('/api/v1/login', {
      headers: { 'Accept': 'application/json', 'Content-type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ ...values })
    });

    if (response.ok) {
      const { token } = await response.json();
      window.localStorage.setItem('jwt', token);
      history.push(Routes.Lookup);
    } else {
      setSubmitError(response.error || response.statusText || response);
    }
  };

  return (
    <Page >
      <Grid container alignItems="center" justify="center" >
        <Grid item xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card className={classes.card} variant="outlined">
            <CardContent>
              <Formik
                initialValues={initialValues}
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
              >
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography className={classes.cardTitle} variant="h2">
                        Public Health Official Login
                      </Typography>
                    </Grid>

                    {/** Username */}
                    <Grid item xs={12}>
                      <Field name="username">
                        {({ field, meta }) => (
                          <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            error={meta.touched && !!meta.error}
                            helperText={(meta.touched && !!meta.error) && <FormHelperText error>{meta.error}</FormHelperText>}
                            {...field}
                          />
                        )}
                      </Field>
                    </Grid>

                    {/** Password */}
                    <Grid item xs={12}>
                      <Field name="password">
                        {({ field, meta }) => (
                          <TextField
                            label="Password"
                            variant="outlined"
                            type="password"
                            fullWidth
                            error={meta.touched && !!meta.error}
                            helperText={(meta.touched && !!meta.error) && <FormHelperText error>{meta.error}</FormHelperText>}
                            {...field}
                          />
                        )}
                      </Field>
                    </Grid>

                    {/** Submit */}
                    <Grid item xs={12}>
                      <Button
                        className={classes.submitBtn}
                        variant="contained"
                        color="primary"
                        type="submit"
                        fullWidth
                      >
                        Login
                      </Button>
                    </Grid>

                    {/** Submit Errors */}
                    {submitError && (
                      <Grid item xs={12}>
                        <Typography color="error">
                          Login failed... {submitError.message || submitError}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Form>
              </Formik>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
};

export default AdminLogin;
