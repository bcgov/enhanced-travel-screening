import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 'calc(100vh - 82px)',
    backgroundColor: '#f5f5f5',
  },
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
  button: {
    height: '54px',
  },
}));

const Login = () => {
  const history = useHistory();
  const classes = useStyles();
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async () => {
    const response = await fetch('/api/v1/login', {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ ...formValues })
    })
    if (response.ok) {
      const { user, token } = await response.json();
      window.localStorage.setItem('jwt', token);
      history.push('/lookup');
      // handle redirect?
      // what does a token enable someone to do?
      // how do we want to handle user state
    } else {
      setError(response.error || response.statusText || response)
    }
  };

  return (
    <Grid className={classes.root} container justify="center" alignItems="center">
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
                  className={classes.button}
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  fullWidth
                >
                  Submit Determination
                </Button>
              </Grid>
              {error && <Grid item xs={12}>
                <Typography>
                  Login failed... {error.message || error}
                </Typography>
              </Grid>}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Login;
