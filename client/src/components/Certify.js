import Typography from '@material-ui/core/Typography';
import React, { Fragment } from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import Disclaimer from './Disclaimer';
import { Button } from './generic';

const Certify = ({ toggleCertified, certified }) => {
  return (
    <Fragment>

      <Grid style={{padding: "1rem"}} container>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={certified}
                onChange={(e) => toggleCertified(e.target.checked)}
                name="certified"
              />
            }
            label={`I certify this to be accurate.`}
          />
        </Grid>
      </Grid>

      <Grid alignContent="center" justify="center" alignItems="center" item xs={12} container>
        <Box padding="1rem">
          <Disclaimer />
        </Box>
        <Grid item xs={8}>
          <Button
            type="submit"
            onClick={handleSubmit}
            loading={submitLoading}
          />
        </Grid>
      </Grid>

      {(!isDisabled && submitError) && (
        <Grid alignContent="center" justify="center" alignItems="center" item xs={12} container>
          <Grid item xs={12}>
            <Box padding="1rem">
              <Typography variant="body1" color="error">
                {submitError}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      )}
    </Fragment>
  );
};

export { Certify };
