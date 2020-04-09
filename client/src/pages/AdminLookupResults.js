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
  divider: {
    height: '3px',
    backgroundColor: '#E2A014',
    color: '#E2A014',
    borderStyle: 'solid',
  },
  button: {
    height: '54px',
  },
}));

const AdminLookupResults = ({ match: { params }}) => {
  const classes = useStyles();
  const history = useHistory();
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetermination, setLoadingDetermination] = useState(false);
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
      } else {
        setError(`Failed to find submission with ID ${params.id}`);
      }
      setLoading(false);
    })();
  }, [params.id]);

  const handleChange = ({ name, value }) => {
    setSidebarFormValues(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoadingDetermination(true)
    try {
      const jwt = window.localStorage.getItem('jwt');
      const response = await fetch(`/api/v1/form/${params.id}`, {
        headers: { 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer ${jwt}` },
        method: 'PATCH',
        body: JSON.stringify({ ...sidebarFormValues })
      });
      if (response.ok) {
        setUpdateSuccess(true);
      } else {
        throw new Error(response.error || 'Failed to update this submission.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingDetermination(false);
    }
  };

  return (
   <Page>
     {(loading || error) ? (
       <div className={classes.statusWrapper}>
         {loading && <CircularProgress />}
         {/* TODO error type? if submission update fails this becomes misleading */}
         {error && (
           <Container maxWidth="sm" align="center">
             <Typography paragraph>Lookup failed... {error.message || error}</Typography>
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
           <Form initialValues={initialValues} isDisabled confirmationNumber={params.id} isPdf={false} />
         </Grid>

         {/** Sidebar */}
         <Grid className={classes.sidebarWrapper} item xs={12} md={4}>
           <Grid container spacing={4}>
             <Grid item xs={12}>
               <Typography className={classes.sidebarTitle} variant="h2">
                 Public Health Official Determination
               </Typography>
               <hr className={classes.divider} />
             </Grid>
             <Grid item xs={12}>
               <Typography style={{ marginBottom: "1rem" }} variant="h6">Determination</Typography>
               <ButtonGroup
                 className={classes.buttonGroup}
                 orientation="vertical"
                 color="primary"
                 fullWidth
               >
                 <Button
                   onClick={(e) => handleChange({ name: 'determination', value: 'support' })}
                   variant={sidebarFormValues.determination === 'support' ? 'contained' : 'outlined'}
                   style={{
                     backgroundColor: sidebarFormValues.determination === 'support' ? '#F5A623' : 'unset',
                   }}
                 >
                   Support Needed
                 </Button>
                 <Button
                   onClick={(e) => handleChange({ name: 'determination', value: 'accepted' })}
                   variant={sidebarFormValues.determination === 'accepted' ? 'contained' : 'outlined'}
                 >
                   Isolation Plan Approved
                 </Button>
                 {/* <Button
                   onClick={(e) => handleChange({ name: 'determination', value: 'rejected' })}
                   variant={sidebarFormValues.determination === 'rejected' ? 'contained' : 'outlined'}
                   >
                   PLAN NOT ACCEPTED
                 </Button> */}
               </ButtonGroup>
             </Grid>
             <Grid item xs={12}>
               <Typography variant="h6">Notes*</Typography>
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
               {loadingDetermination
                 ? <CircularProgress />
                 : <Button
                     className={classes.button}
                     variant="contained"
                     color="primary"
                     onClick={handleSubmit}
                     fullWidth
                     disabled={!sidebarFormValues.determination || !sidebarFormValues.notes}
                   >
                    Submit Determination
                   </Button>
               }
             </Grid>
             {updateSuccess && <Typography textAlign="center" color="secondary">Submission Updated</Typography>}
           </Grid>
         </Grid>
       </Fragment>
     )}
   </Page>
  );
};

export default AdminLookupResults;
