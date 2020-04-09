import React, { Fragment, useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import { Formik, Form, Field } from 'formik';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import { SidebarSchema } from '../validation-schemas';

import Page from '../components/Page';
import UserForm from '../components/Form';
import { RenderButtonGroup, RenderTextField } from '../components/fields';

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
  const [lookupError, setLookupError] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [initialUserFormValues, setInitialUserFormValues] = useState(null);
  const [initialSidebarValues, setInitialSidebarValues] = useState({
    determination: '',
    notes: '',
  });

  /**
   * On page load, grab the ID from the url and perform a search
   * query to find the matching form data.
   */
  useEffect(() => {
    (async () => {
      setLookupLoading(true);

      const jwt = window.localStorage.getItem('jwt');
      const response = await fetch(`/api/v1/form/${params.id}`, {
        headers: { 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer ${jwt}` },
        method: 'GET',
      });

      if (response.ok) {
        const { determination, notes, ...rest } = await response.json();
        setInitialUserFormValues(rest);
        setInitialSidebarValues({ determination, notes });
      } else {
        setLookupError(`Failed to find submission with ID ${params.id}`);
      }

      setLookupLoading(false);
    })();
  }, [params.id]);

  const handleSubmit = async (values) => {
    setSubmitLoading(true);

    const jwt = window.localStorage.getItem('jwt');
    const response = await fetch(`/api/v1/form/${params.id}`, {
      headers: { 'Accept': 'application/json', 'Content-type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      method: 'PATCH',
      body: JSON.stringify({ ...values })
    });

    if (response.ok) setSubmitSuccess(true);
    else setSubmitError(response.error || 'Failed to update this submission.');
    setSubmitLoading(false);
  };

  return (
   <Page>
     {(lookupLoading || lookupError) ? (
       <div className={classes.statusWrapper}>
         {lookupLoading && <CircularProgress />}
         {lookupError && (
           <Container maxWidth="sm" align="center">
             <Typography paragraph>Lookup failed... {lookupError.message || lookupError}</Typography>
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
           <UserForm initialValues={initialUserFormValues} isDisabled id={params.id} isPdf={false} />
         </Grid>

         {/** Sidebar */}
         <Grid className={classes.sidebarWrapper} item xs={12} md={4}>
           <Formik
             initialValues={initialSidebarValues}
             validationSchema={SidebarSchema}
             onSubmit={handleSubmit}
           >
             <Form>
               <Grid container spacing={3}>

                 {/** Title */}
                 <Grid item xs={12}>
                   <Typography className={classes.sidebarTitle} variant="h2">
                     Public Health Official Determination
                   </Typography>
                   <hr className={classes.divider} />
                 </Grid>

                 {/** Determination */}
                 <Grid item xs={12}>
                   <Typography paragraph variant="body1"><b>Determination*</b></Typography>
                   <Field
                     name="determination"
                     component={RenderButtonGroup}
                     options={[
                       { value: 'support', label: 'Support Needed', color: 'secondary' },
                       { value: 'accepted', label: 'Isolation Plan Approved', color: 'primary' },
                     ]}
                   />
                 </Grid>

                 {/** Notes */}
                 <Grid item xs={12}>
                   <Typography paragraph variant="body1"><b>Notes*</b></Typography>
                   <Field
                     name="notes"
                     component={RenderTextField}
                     placeholder="Add notes to support your decision..."
                     multiline
                     rows={10}
                   />
                 </Grid>

                 {/** Submit */}
                 <Grid item xs={12}>
                   {submitLoading ? <CircularProgress /> :
                     <Button
                       className={classes.button}
                       variant="contained"
                       color="primary"
                       type="submit"
                       fullWidth
                     >
                       Submit Determination
                     </Button>
                   }
                 </Grid>

                 {/** Submit Success / Error */}
                 <Grid item xs={12}>
                   {submitError && <Typography color="error">{submitError}</Typography>}
                   {submitSuccess && <Typography color="primary">Submission Updated</Typography>}
                 </Grid>
               </Grid>
             </Form>
           </Formik>
         </Grid>
       </Fragment>
     )}
   </Page>
  );
};

export default AdminLookupResults;
