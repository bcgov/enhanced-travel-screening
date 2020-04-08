import React from 'react';
import { Grid, Typography, Card, CardContent, Box, Button, Hidden } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Page from '../components/Page';

import Health from '../assets/images/Health.svg';
import Pass from '../assets/images/PlanPass.svg';
// import Positive from '../assets/images/Positive.png';
import Support from '../assets/images/Support.png';

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'center',
  }
}));

function Confirmation ({ location: { state } }) {

  const classes = useStyles();
  const { healthStatus, isolationPlanStatus, id, accessToken } = state || { healthStatus: "Accepted", isolationPlanStatus: "Accepted" };

  const genPDF = async () => {
    const response = await fetch(`/api/v1/pdf/${id}`, {
      headers: {
        'Accept': 'application/pdf',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (response.ok) {
      const blob = await response.blob()
      const pdfBlob = new Blob([blob], {type: "application/pdf"})
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(pdfBlob);
        return;
      }
      // For other browsers:
      // Create a link pointing to the ObjectURL containing the blob.
      const data = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = data;
      link.download = `screeningReport-${id}.pdf`;
      link.click();
      setTimeout(function(){
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(data);
      }, 100);
    }
  }

  return (
    <Page>
      <Grid className={classes.root} container justify="center">
        <Grid item xs={12} sm={12} md={10} lg={8} xl={8}>
          <Box margin="2rem 0">
            <Typography variant="h4">
              Thank you. Your form has been submitted.
            </Typography>

            <Typography variant="h4">
              Do not close this page.
            </Typography>
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Grid container>
                <Grid item xs={12}>
                  <Box padding="1rem" paddingTop="0">
                    <Typography variant="h6">
                      Proceed to CBSA agent and present this device's screen.
                    </Typography>
                    <Typography variant="subtitle1">
                      You will be asked to present your confirmation number to your CBSA agent and Public Health Officials. Rescor your confirmation number for your records.
                    </Typography>
                  </Box>
                </Grid>
                <Hidden smDown>
                  <Grid item md={3}></Grid>
                </Hidden>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">Confirmation Number</Typography>
                      <Typography variant="h2" color="primary">
                        {id}
                      </Typography>
                      <Grid container style={{marginTop: "2rem"}}>
                        <Grid item xs={6}>
                          {healthStatus === "accepted" ? <img src={Health} alt="submission is healthy" /> : <img src={Support} alt="needs support" />}
                          <Typography variant="subtitle1">Health Status Complete</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          {isolationPlanStatus === "accepted" ? <img src={Pass} alt="submission passes" /> : <img src={Support} alt="needs support" />}
                          <Typography variant="subtitle1">Isolation Plan Status Complete</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {accessToken && <Box marginTop="1rem">
                <Grid item xs={6} style={{margin: "auto"}}>
                  <Typography variant="h6">Download your form submission as a PDF document.</Typography>
                  <Typography variant="subtitle1">Use the button below to download your submission as a PDF (.pdf) document for your records.</Typography>
                  <Button
                    variant="contained"
                    size="large"
                    color="primary"
                    style={{marginTop: "1rem"}}
                    onClick={genPDF}
                    fullWidth
                  >
                  Download PDF of Submission</Button>
                </Grid>
              </Box>}
            </CardContent>
          </Card>

        </Grid>
      </Grid>
    </Page>
  )
}

export default Confirmation;
