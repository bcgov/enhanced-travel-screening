import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@material-ui/core';
// import HealthPass from '../assets/images/icon_health_pass.svg';
// import HealthFail from '../assets/images/icon_health_fail.svg';
import PlanPass from '../assets/images/icon_isolation_pass.svg';
import PlanFail from '../assets/images/icon_isolation_fail.svg';

const passStyles = {
  height: '36px',
  color: '#16C92E',
  fontfamily: 'Lato',
  fontsize: '12px',
  fontweight: 'bold',
  letterSpacing: 0,
  lineHeight: '18px',
  textAlign: 'center',
  marginTop: '10px',
}
const failStyles = {
  height: '36px',
  color: '#FF534A',
  fontFamily: 'Lato',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: 0,
  lineHeight: '18px',
  textAlign: 'center',
  marginTop: '10px',
}

function SubmissionInfo ({ id, healthStatus, isolationPlanStatus, isPdf = false }) {
  return (
    <Box padding='1.5rem 1rem 1rem 1rem'>
      <Grid container spacing={4}>
        <Grid xs={isPdf ? 12 : 6} item>
          <Card style={{height: '150px'}}>
            <CardContent>
              <Typography align="center" variant="subtitle1">Confirmation Number</Typography>
              <Typography align="center" variant="h2" color="primary">
                {id}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {!isPdf && <Grid xs={6} item>
          <Card style={{height: '150px', padding: '1rem'}}>
            <CardContent>
              <Grid container>
                {/* <Grid item xs={6}>
                  <Box style={{textAlign: 'center'}}>
                    <img style={{height: '50px'}} src={healthStatus === "accepted" ? HealthPass : HealthFail} alt="health status accepted or failed" />
                    <Typography style={healthStatus === "accepted" ? passStyles : failStyles} variant="subtitle1">Health Status Complete</Typography>
                  </Box>
                </Grid> */}
                <Grid item xs={12}>
                  <Box style={{textAlign: 'center'}}>
                    <img style={{height: '50px'}} src={isolationPlanStatus ? PlanPass : PlanFail} alt="Isolation plan accepted or failed" />
                    <Typography style={isolationPlanStatus ? passStyles : failStyles} variant="subtitle1">Isolation Plan Status Complete</Typography>
                  </Box>
                </Grid>
              </Grid>

            </CardContent>
          </Card>
        </Grid>}
      </Grid>
    </Box>

  )
}

export default SubmissionInfo;
