import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import { Formik, Form, Field } from 'formik';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import Routes from '../constants/routes';
import { LookupSchema } from '../validation-schemas';

import Page from '../components/Page';
import { RenderTextField } from '../components/fields';

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

                    {/** Title */}
                    <Grid item xs={12}>
                      <Typography className={classes.cardTitle} variant="h2">
                        Submission Lookup
                      </Typography>
                    </Grid>

                    <Grid item xs={12} container>

                      {/** Confirmation Number */}
                      <Grid item xs={12} sm={7} md={8}>
                        <Field
                          className={classes.textField}
                          name="confirmationNumber"
                          component={RenderTextField}
                          placeholder="Enter Confirmation Number eg: BC12345"
                        />
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
