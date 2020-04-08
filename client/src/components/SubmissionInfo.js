import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@material-ui/core';
import Health from '../assets/images/Health.svg';
import Pass from '../assets/images/PlanPass.svg';
// import Positive from '../assets/images/Positive.png';
import Support from '../assets/images/Support.png';

function SubmissionInfo ({ id, healthStatus = "accepted", isolationPlanStatus = "accepted" }) {
  return (
    <Box padding='1.5rem 1rem 1rem 1rem'>
      <Grid container spacing={4}>
        <Grid xs={6} item>
          <Card style={{height: '150px'}}>
            <CardContent>
              <Typography align="center" variant="subtitle1">Confirmation Number</Typography>
              <Typography align="center" variant="h2" color="primary">
                {id}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} item>
          <Card style={{height: '150px', padding: '1rem'}}>
            <CardContent>
              <Grid container>
                <Grid item xs={6}>
                  <Box style={{textAlign: 'center'}}>
                    {healthStatus === "accepted" ? <img src={Health} alt="submission is healthy" /> : <img src={Support} alt="needs support" />}
                    <Typography variant="subtitle1">Health Status Complete</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box style={{textAlign: 'center'}}>
                    {isolationPlanStatus === "accepted" ? <img src={Pass} alt="submission passes" /> : <img src={Support} alt="needs support" />}
                    <Typography variant="subtitle1">Isolation Plan Status Complete</Typography>
                  </Box>
                </Grid>
              </Grid>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>

  )
}

export default SubmissionInfo;
