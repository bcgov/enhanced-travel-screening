import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

import Personal from '../components/Personal';
import AdditionalTravelers from '../components/AdditionalTravelers';
import Symptoms from '../components/Symptoms';
import IsolationPlan from '../components/IsolationPlan';

const useStyles = makeStyles((theme) => ({
  root: {
    height: 'calc(100vh - 82px)',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  card: {
    padding: theme.spacing(4, 2),
    margin: theme.spacing(2),
  },
  cardTitle: {
    height: '24px',
    color: '#000000',
    fontSize: '20px',
    fontWeight: 500,
    letterSpacing: 0,
    lineHeight: '24px',
  },
  textField: {
    '& > .MuiOutlinedInput-root': {
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0',
    },
    marginTop: '0.25rem'
  },
  select: {
    marginTop: '0.25rem',
  },
  stretch: {
    width: '100%'
  },
  formLabel: {
    color: 'black'
  },
  inlineFormControl: {
    display: 'inline'
  },
  button: {
    minHeight: '54px',
    height: '100%',
  },
  hr: {
    height: '3px',
    backgroundColor: '#E2A014',
    color: '#E2A014',
    borderStyle: 'solid',
  },

  // Form
  form: {
    height: '100%',
    overflowY: 'auto',
  },


  // Sidebar
  sidebar: {
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
}));

const SubmissionView = () => {
  const classes = useStyles();
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    telephone: '',
    mobile: '',
    reach: '',
    email: '',
    essentialWorker: '',
    role: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    healthCareNumber: '',
    dob: '',
    householdTravelers: '',
    additionalTravelers: [],
    locations: []
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues(prevState => ({ ...prevState, [name]: value }));
  };

  const handleDeterminationClick = (e, b) => {

  };

  const handleSubmit = () => {
    // TODO: ...
  };

  return (
   <Grid className={classes.root} container>

     {/** Form */}
     <Grid className={classes.form} item xs={12} md={8}>
       <Grid container justify="center" alignItems="center">
         <Grid item xs={12} sm={12}>
           <Card variant="outlined" className={classes.card}>
             <CardContent>
               <Grid container>
                 <Personal classes={classes} saveInfo={handleChange} formValues={formValues} />
                 <AdditionalTravelers classes={classes} saveInfo={handleChange} formValues={formValues} />
                 <Symptoms classes={classes} />
                 <IsolationPlan classes={classes} />
               </Grid>
             </CardContent>
           </Card>
         </Grid>
       </Grid>
     </Grid>

     {/** Sidebar */}
     <Grid className={classes.sidebar} item xs={12} md={4}>
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
             onClick={handleDeterminationClick}
           >
             <Button>PLAN ACCEPTED</Button>
             <Button>PLAN REQUIRES SUPPORT</Button>
             <Button>PLAN NOT ACCEPTED</Button>
           </ButtonGroup>
         </Grid>
         <Grid item xs={12}>
           <Typography variant="body1">Notes</Typography>
           <TextField
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


   </Grid>
  );
};

export default SubmissionView;
