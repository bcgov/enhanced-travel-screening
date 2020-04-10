import React from 'react';
import { Typography, Box } from '@material-ui/core';

function Disclaimer() {
  return (
    <Box>
      <Typography variant="body1">
        Collection Notice
      </Typography>
      <Typography variant="caption" paragraph>
        Your personal information as well as those of your household is collected by the Ministry 
        of Health under the authority of sections 26(a), (c), (e) and s.27(1)(a)(iii) of the 
        Freedom of Information and Protection of Privacy Act, the Public Health Act and the 
        federal Quarantine Act, for the purposes of reducing the spread of COVID-19. Personal 
        information may be shared with personnel providing support services and follow-up during 
        self-isolation. Should you have any questions or concerns about the collection of your 
        personal information please contact:
      </Typography>
      <Typography variant="caption" paragraph>
        Title: Ministry of Health, Chief Privacy Officer
      </Typography>
      <Typography variant="caption" paragraph>
        Telephone: 236-478-1666
      </Typography>
    </Box>
  )
}

export default Disclaimer;
