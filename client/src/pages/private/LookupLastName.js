import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Field, Form, Formik } from 'formik';
import { useHistory, useParams } from 'react-router-dom';

import { Routes } from '../../constants';

import { Button, Page, Table } from '../../components/generic';
import { RenderSearchField } from '../../components/fields';

export default () => {
  const history = useHistory();
  const params = useParams();
  const [isLoading, setLoading] = useState(false);
  const [rows, setRows] = useState([
    {
      date: '2020/01/01',
      lastName: 'Wilson',
      firstName: 'Ricky',
      cityCountry: 'Shellbrook, CA',
      confirmationNumber: '234FSGA',
      viewMore: <Button size="small" text="View" />,
    },
    {
      date: '2020/01/01',
      lastName: 'Wilson',
      firstName: 'Ricky',
      cityCountry: 'Shellbrook, CA',
      confirmationNumber: '234FSGA',
      viewMore: <Button size="small" text="View" />,
    },
  ]);
  const columns = ['Date', 'Last Name', 'First Name', 'Arrival City, Country', 'Confirmation Number'];
  const initialValuesQuery = { query: params.lastName };

  /**
   * On page load / on search, grab the name from the url and perform a search
   * query on the `lastName`.
   */
  useEffect(() => {
    setLoading(true);

    // TODO: Call API...
    setTimeout(() => {
      setLoading(false);
    }, 3000)
  }, [params.lastName]);

  const handleSearch = (values) => {
    history.push(Routes.LookupLastName.dynamicRoute(values.query));
  };

  return (
   <Page>
     <Grid container justify="center">
       <Grid item xs={12} sm={12} md={10} lg={8} xl={6}>
         <Box m={4}>
           <Grid container spacing={3}>

             {/** Title */}
             <Grid item xs={12}>
               <Typography color="primary" variant="h2" gutterBottom noWrap>
                 Submission Lookup
               </Typography>
             </Grid>

             <Grid item xs={12}>
               <Grid container alignItems="center" justify="space-between">

                 {/** Results Text */}
                 <Grid item>
                   <Typography variant="subtitle2" gutterBottom noWrap>
                     {rows.length} Records found for "{params.lastName}"
                   </Typography>
                 </Grid>

                 {/** Search Bar */}
                 <Grid item xs={12} sm={6}>
                   <Formik
                     initialValues={initialValuesQuery}
                     onSubmit={handleSearch}
                   >
                     <Form>
                       <Field
                         name="query"
                         component={RenderSearchField}
                         placeholder="Search last name..."
                       />
                     </Form>
                   </Formik>
                 </Grid>
               </Grid>
             </Grid>

             {/** Table */}
             <Grid item xs={12}>
               <Table
                 columns={columns}
                 rows={rows}
                 isLoading={isLoading}
               />
             </Grid>
           </Grid>
         </Box>
       </Grid>
     </Grid>
   </Page>
  );
};
