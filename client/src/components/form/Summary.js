import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  primaryText: {
    color: '#002C71',
  },
  mt1: {
    marginTop: '1rem',
  },
}));

const Summary = () => {
  const classes = useStyles();
  return (
    <Fragment>
      <Typography variant="h5" gutterBottom>
        Self-Isolation Plan
      </Typography>
      <Typography variant="body1" gutterBottom>
        B.C. has declared a state of emergency. To ensure the safety of all British Columbians you are being asked to
        declare your journey details and how you plan to self isolate. Please complete the form below.
      </Typography>
      <Typography variant="body1" gutterBottom className={classes.mt1}>
        Need help with your self isolation plan? {window.innerWidth < 600 && <br />}
        <a
          className={classes.primaryText}
          href="https://www2.gov.bc.ca/gov/content/home/get-help-with-government-services"
          target="__blank"
          rel="noreferrer noopener"
        >
          Talk to a Service BC agent
        </a>
      </Typography>
      <Typography variant="body1" gutterBottom className={classes.mt1}>
        Download a &nbsp;
        <a
          className={classes.primaryText}
          href="https://www2.gov.bc.ca/assets/gov/health-safety/support_for_travellers_print.pdf"
          target="__blank"
          rel="noreferrer noopener"
        >
          PDF version of this form
        </a>
      </Typography>
    </Fragment>
  );
};

export { Summary };
