import React from 'react';
import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';

function Certify ({ toggleCertified, certified }) {
  return (
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

  )
}

export default Certify;
