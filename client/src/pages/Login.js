import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

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

const Login = () => {
  const history = useHistory();
  const classes = useStyles();
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues(prevState => ({ ...prevState, [name]: value }));
  };

  // TODO: Figure out these questions:
  // - How to handle redirect?
  // - What does a token enable someone to do?
  // - How do we want to handle user state?
  const handleSubmit = async () => {
    const response = await fetch('/api/v1/login', {
      headers: { 'Accept': 'application/json', 'Content-type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({ ...formValues })
    });

    if (response.ok) {
      const { token } = await response.json();
      window.localStorage.setItem('jwt', token);
      history.push('/lookup');
    } else {
      setError(response.error || response.statusText || response);
    }
  };

  return (
    <Page>
      <Grid item xs={12} sm={8} md={6} lg={4} xl={3}>
        <Card className={classes.card} variant="outlined">
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography className={classes.cardTitle} variant="h2">
                  Public Health Official Login
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="username"
                  value={formValues.username}
                  label="Username"
                  variant="outlined"
                  type="email"
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="password"
                  value={formValues.password}
                  label="Password"
                  variant="outlined"
                  type="password"
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  className={classes.submitBtn}
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  fullWidth
                >
                  Login
                </Button>
              </Grid>
              {error && (
                <Grid item xs={12}>
                  <Typography color="error">
                    Login failed... {error.message || error}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Page>
  );
};

export default Login;
