import React, { Fragment, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import Page from '../components/Page';
import Form from '../components/Form';

const useStyles = makeStyles((theme) => ({
  statusWrapper: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formWrapper: {
    height: '100%',
    overflowY: 'auto',
  },
  sidebarWrapper: {
    height: '100%',
    boxShadow: '0 0 15px 0 rgba(0,0,0,0.2)',
    backgroundColor: '#FFFFFF',
    padding: theme.spacing(4, 3),
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    lineHeight: '24px',
  },
  buttonGroup: {
    '& > button': {
      padding: theme.spacing(2),
      fontWeight: 'bold',
      fontSize: '13px',
      lineHeight: '18px',
      letterSpacing: '0.81px',
    },
  },
  button: {
    height: '54px',
  },
}));

const SubmissionView = ({ match: { params }}) => {
  const classes = useStyles();
  const history = useHistory();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const [sidebarFormValues, setSidebarFormValues] = useState({
    determination: '',
    notes: '',
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const jwt = window.localStorage.getItem('jwt');
      const response = await fetch(`/api/v1/form/${params.id}`, {
        headers: { 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer ${jwt}` },
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setInitialValues(data);
        console.log(data);
      } else {
        setError(`Failed to find submission with ID ${params.id}`);
      }
      setLoading(false);
    })();
  }, [params.id]);

  const handleChange = ({ name, value }) => {
    setSidebarFormValues(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = () => {
    // TODO: ...
  };

  return (
   <Page>
     {(loading || error) ? (
       <div className={classes.statusWrapper}>
         {loading && <CircularProgress />}
         {error && (
           <Container maxWidth="sm" align="center">
             <Typography paragraph color="error">Lookup failed... {error.message || error}</Typography>
             <Button
               className={classes.button}
               variant="contained"
               color="primary"
               size="large"
               onClick={() => history.push('/lookup')}
             >
               Back to Lookup
             </Button>
           </Container>
         )}
       </div>
     ) : (
       <Fragment>

         {/** Form */}
         <Grid className={classes.formWrapper} item xs={12} md={8}>
           <Form initialValues={initialValues} isDisabled />
         </Grid>

         {/** Sidebar */}
         <Grid className={classes.sidebarWrapper} item xs={12} md={4}>
           <Grid container spacing={4}>
             <Grid item xs={12}>
               <Typography className={classes.sidebarTitle} variant="h2">
                 Public Health Official Determination
               </Typography>
             </Grid>
             <Grid item xs={12}>
               <Typography variant="body1">Determination</Typography>
               <ButtonGroup
                 className={classes.buttonGroup}
                 orientation="vertical"
                 color="primary"
                 fullWidth
               >
                 <Button
                   onClick={(e) => handleChange({ name: 'determination', value: 'accepted' })}
                   variant={sidebarFormValues.determination === 'accepted' ? 'contained' : 'outlined'}
                 >
                   PLAN ACCEPTED
                 </Button>
                 <Button
                   onClick={(e) => handleChange({ name: 'determination', value: 'requires-support' })}
                   variant={sidebarFormValues.determination === 'requires-support' ? 'contained' : 'outlined'}
                 >
                   PLAN REQUIRES SUPPORT
                 </Button>
                 <Button
                   onClick={(e) => handleChange({ name: 'determination', value: 'not-accepted' })}
                   variant={sidebarFormValues.determination === 'not-accepted' ? 'contained' : 'outlined'}
                 >
                   PLAN NOT ACCEPTED
                 </Button>
               </ButtonGroup>
             </Grid>
             <Grid item xs={12}>
               <Typography variant="body1">Notes</Typography>
               <TextField
                 value={sidebarFormValues.notes}
                 name="notes"
                 onChange={(e) => handleChange({ name: e.target.name, value: e.target.value })}
                 variant="outlined"
                 placeholder="Add notes to support your decision..."
                 multiline
                 rows={10}
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
           </Grid>
         </Grid>
       </Fragment>
     )}
   </Page>
  );
};

export default SubmissionView;
