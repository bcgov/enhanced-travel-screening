import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Field } from 'formik';

import { RenderDateField, RenderSelectField, RenderTextField } from '../fields';

const Arrival = ({ isDisabled }) => {
  return (
    <Grid item xs={12}>
      <Grid container spacing={3}>

        {/** Title */}
        <Grid item xs={12}>
          <Typography variant="h6">Arrival Information</Typography>
        </Grid>

        {/** Arrival Date */}
        <Grid item xs={12} md={6}>
          <Field
            name="arrival.date"
            component={RenderDateField}
            label="* Arrival Date (yyyy/mm/dd)"
            disabled={isDisabled}
          />
        </Grid>

        {/** Arrival By */}
        <Grid item xs={12} md={6}>
          <Field
            name="arrival.by"
            component={RenderSelectField}
            label="* Arrival By"
            disabled={isDisabled}
            options={[
              { value: 'air', label: 'Air' },
              { value: 'sea', label: 'Sea' },
              { value: 'land', label: 'Ground Transportation' },
            ]}
          />
        </Grid>

        {/** Airline / Flight Number */}
        <Grid item xs={12} md={6}>
          <Field
            name="arrival.flight"
            component={RenderTextField}
            label="Airline / Flight Number (if applicable)"
            disabled={isDisabled}
          />
        </Grid>

        {/** City */}
        <Grid item xs={12} md={6}>
          <Field
            name="arrival.from"
            component={RenderTextField}
            label="* Arrival From (City, Country)"
            disabled={isDisabled}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export { Arrival };
