import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import PlanPass from '../../assets/images/icon_isolation_pass.svg';
import PlanFail from '../../assets/images/icon_isolation_fail.svg';

import { Card } from '../generic';

const passStyles = {
  fontWeight: 'bold',
  letterSpacing: 0,
  lineHeight: '18px',
  textAlign: 'center',
  marginLeft: '10px',
  color: 'black',
};

const failStyles = {
  fontWeight: 'bold',
  letterSpacing: 0,
  lineHeight: '18px',
  textAlign: 'center',
  marginLeft: '10px',
  color: 'black',
};

const SubmissionInfo = ({ id, isolationPlanStatus, isPdf = false }) => {
  return (
    <Box padding='1.5rem 1rem 1rem 1rem'>
      <Grid container spacing={4}>
        <Grid xs={12} md={6} item>
          <Card style={{height: '150px'}}>
            <Typography align="center" variant="subtitle1">Confirmation Number</Typography>
            <Typography align="center" variant="h2" color="primary">
              {id}
            </Typography>
          </Card>
        </Grid>
        {!isPdf && (
            <Grid xs={12} md={6} item>
              <Card style={{height: '150px', padding: '1rem'}}>
                <Grid container>
                  <Grid item xs={12}>
                    <Box style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                      <img style={{height: '80px', marginRight: '10px'}} src={isolationPlanStatus ? PlanPass : PlanFail} alt="Isolation plan accepted or failed" />
                      <Typography style={isolationPlanStatus ? passStyles : failStyles} variant="h6">Isolation Plan Status</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          )}
      </Grid>
    </Box>
  );
};

export { SubmissionInfo };
