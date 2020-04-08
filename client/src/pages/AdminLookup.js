import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

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
  viewButton: {
    minHeight: '54px',
    height: '100%',
    borderTopLeftRadius: '0',
    borderBottomLeftRadius: '0',
  },
}));

const AdminLookup = () => {
  const classes = useStyles();
  const history = useHistory();
  const [formValues, setFormValues] = useState({
    confirmationNumber: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = () => {
    history.push(Routes.LookupResults.dynamicRoute(formValues.confirmationNumber));
  };

  return (
    <Page>
      <Grid container alignItems="center" justify="center">
        <Grid item xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className={classes.card} variant="outlined">
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography className={classes.cardTitle} variant="h2">
                    Submission Lookup
                  </Typography>
                </Grid>
                <Grid item xs={12} container>
                  <Grid item xs={12} sm={7} md={8}>
                    <TextField
                      className={classes.textField}
                      name="confirmationNumber"
                      value={formValues.confirmationNumber}
                      placeholder="Enter Confirmation Number eg: BC12345"
                      variant="outlined"
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={5} md={4}>
                    <Button
                      className={classes.viewButton}
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      fullWidth
                    >
                      View Submission
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
};

export default AdminLookup;
