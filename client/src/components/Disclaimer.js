import React from 'react';
import { Typography, Box } from '@material-ui/core';

function Disclaimer() {
  return (
    <Box padding='1rem'>
      <Typography variant="h6">
        Collection Notice
      </Typography>
      <Typography variant="body2">
        Your personal information as well as those of your household is collected by the Ministry of Health under the authority of sections 26(a), (c), (e) and s.27(1)(a)(iii) of the Freedom of Information and Protection of Privacy Act, the Public Health Act and the federal Quarantine Act, for the purposes of reducing the spread of COVID-19.
        Personal information may be shared with personnel providing support services and follow-up during self-isolation. Should you have any questions or concerns about the collection of your personal information please contact:
        Alison Pearce, Chief Privacy Officer
        PO Box 9636 STN PROV GOVT
        Victoria BC  V8W 9P1
        250-415-1061
        Alison.Pearce@gov.bc.ca
      </Typography>
    </Box>
  )
}

export default Disclaimer;
