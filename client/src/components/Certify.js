import React from 'react';
import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';

function Certify ({ toggleCertified, certified, firstName, lastName }) {
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
          label={`I ${firstName} ${lastName} certify the information I have provided above to be accurate to the best of my knowledge. I also understand that providing false information could endanger the lives of British Columbia residents.`}
        />
      </Grid>
    </Grid>

  )
}

export default Certify;
