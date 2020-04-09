import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@material-ui/core';

const Contact = function({ classes }) {
  return (
    <Card>
      <CardContent>
        <Box textAlign="center" padding="1rem">
          <Typography variant="h5" gutterBottom>
            Need Assistance?
          </Typography>
          <Typography variant="body1" gutterBottom>Need help with your self isolation plan? Talk to a Service BC agent</Typography>
          <ul style={{listStyle: 'none', padding: 0}}>
            <li>Child Care</li>
            <li>Travel restrictions</li>
            <li>Business and funding support</li>
          </ul>
          <b>Service is available 7:30am to 8pm Pacific Time</b>
          <p>
            <b>International</b>
          </p>
          <p>
            <Button className={classes.contactButton} variant="outlined" color="primary">1-604-412-0957</Button>
          </p>
          <p><b>Within Canada</b></p>
          <p><Button className={classes.contactButton} color="primary" variant="outlined">Text 1-604-630-0300</Button></p>
          <p><Button className={classes.contactButton} color="primary" variant="outlined">Call 1-888-COVID19</Button></p>
          <p><a style={{color: '#002C71'}} href="tel:1-888-268-4319">(1-888-268-4319)</a></p>
          <p>Standard message and data rates may apply.</p>
          <hr />
          <p><b>Telephone for the Deaf</b></p>
          <p><Button className={classes.contactButton} color="primary" variant="outlined">Across B.C. Dial 711</Button></p>
          <hr />
          <p><b>Translation Services</b></p>
          <p>Available in more than 110+ languages, including</p>
          <ul style={{listStyle: 'none', padding: 0}}>
            <li>翻譯服務</li>
            <li>翻译服务 </li>
            <li>ਅਨੁਵਾਦਸਰਵਿਸਿਜ</li>
            <li> خدمات  ت  رج  م  ه؟</li>
            <li>Services de traduction </li>
            <li>Servicios de traducción</li>
          </ul>
          <p><b>Service is available 7:30 am to 8 pm Pacific Time</b></p>
          <div><Button className={classes.contactButton} color="primary" variant="outlined">Call 1-888-268-4319</Button></div>
        </Box>
      </CardContent>
    </Card>
  )
}

export { Contact };
