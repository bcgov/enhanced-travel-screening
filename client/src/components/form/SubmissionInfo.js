import React from 'react';
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
    <Grid container spacing={4}>
      <Grid xs={12} md={6} item>
        <Card style={{height: '150px'}}>
          <Typography align="center" variant="subtitle1">Confirmation Number</Typography>
          <Typography style={{ fontSize: '2.75rem' }} align="center" variant="h3" color="primary">
            {id}
          </Typography>
        </Card>
      </Grid>
      {!isPdf && (
        <Grid xs={12} md={6} item>
          <Card style={{height: '150px', padding: '1rem', alignItems: 'center', display: 'flex'}}>
            <Grid container alignItems="center" justify="center" spacing={1}>
              <Grid item>
                <img style={{height: '60px', marginRight: '10px'}} src={isolationPlanStatus ? PlanPass : PlanFail} alt="Isolation plan accepted or failed" />
              </Grid>
              <Grid item>
                <Typography style={isolationPlanStatus ? passStyles : failStyles} variant="h6">Isolation Plan Status</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export { SubmissionInfo };
