import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
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
  textField: {
    '& > .MuiOutlinedInput-root': {
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0',
    },
  },
  button: {
    height: '56px',
    borderTopLeftRadius: '0',
    borderBottomLeftRadius: '0',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(2),
    },
  },
}));

const LookupSchema = Yup.object().shape({
  confirmationNumber: Yup.string()
    .required('Required'),
});

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
          <Card className={classes.card} variant="outlined">
            <CardContent>
              <Formik
                initialValues={initialValues}
                validationSchema={LookupSchema}
                onSubmit={handleSubmit}
              >
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography className={classes.cardTitle} variant="h2">
                        Submission Lookup
                      </Typography>
                    </Grid>
                    <Grid item xs={12} container>

                      {/** Confirmation Number */}
                      <Grid item xs={12} sm={7} md={8}>
                        <Field name="confirmationNumber">
                          {({ field, meta }) => (
                            <TextField
                              className={classes.textField}
                              placeholder="Enter Confirmation Number eg: BC12345"
                              variant="outlined"
                              fullWidth
                              error={meta.touched && !!meta.error}
                              helperText={(meta.touched && !!meta.error) && <FormHelperText error>{meta.error}</FormHelperText>}
                              {...field}
                            />
                          )}
                        </Field>
                      </Grid>

                      {/** Submit */}
                      <Grid item xs={12} sm={5} md={4}>
                        <Button
                          className={classes.button}
                          variant="contained"
                          color="primary"
                          type="submit"
                          fullWidth
                        >
                          View Submission
                        </Button>
                      </Grid>
                    </Grid>
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

export default AdminLookup;
