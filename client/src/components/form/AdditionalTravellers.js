import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Field, FieldArray, useFormikContext, useField } from 'formik';

import { Divider, Card } from '../generic';
import { RenderDateField, RenderRadioGroup, RenderSelectField, RenderTextField } from '../fields';

const AdditionalTravellers = ({ isDisabled }) => {
  const { values } = useFormikContext();
  const [_, __, helpers] = useField('additionalTravelers');
  return (
    <Grid item xs={12}>
      <Grid container spacing={3}>

        {/** Title */}
        <Grid item xs={12}>
          <Typography variant="h6">Travel Information</Typography>
          <Divider />
        </Grid>

        {/** Additional Travellers */}
        <Grid item xs={12} md={6}>
          <Field
            name="includeAdditionalTravellers"
            component={RenderRadioGroup}
            label="* Are there additional travellers in your group?"
            disabled={isDisabled}
            row
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          />
        </Grid>

        {/** Number of Additional Travellers */}
        {values.includeAdditionalTravellers === 'yes' && (
          <FieldArray
            name="additionalTravelers"
            render={(arrayHelpers) => (
              <Fragment>
                <Grid item xs={12} md={6}>
                  <Field
                    name="numberAdditionalTravellers"
                    component={RenderSelectField}
                    label="* Number of additional travellers in your group?"
                    disabled={isDisabled}
                    onChange={(e) => {
                      const value = e.target.value;
                      let travellers = [];
                      for (let i = 0; i < value; i++) travellers.push({ firstName: '', lastName: '', dob: '1990/01/01' });
                      helpers.setValue(travellers);
                    }}
                    options={[
                      { value: 1, label: '1' },
                      { value: 2, label: '2' },
                      { value: 3, label: '3' },
                      { value: 4, label: '4' },
                      { value: 5, label: '5' },
                      { value: 6, label: '6' },
                      { value: 7, label: '7' },
                      { value: 8, label: '8' },
                      { value: 9, label: '9' },
                      { value: 10, label: '10' },
                    ]}
                  />
                </Grid>
                {values.additionalTravelers.map((traveller, index) => (
                  <Grid key={index} item xs={12}>
                    <Card>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="body1"><b>Additional Traveller Information</b></Typography>
                          <Typography variant="body2">For each traveller, please list their last name, first name and date of birth</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Field
                            name={`additionalTravelers[${index}].firstName`}
                            component={RenderTextField}
                            label="* First name"
                            disabled={isDisabled}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Field
                            name={`additionalTravelers[${index}].lastName`}
                            component={RenderTextField}
                            label="* Last name"
                            disabled={isDisabled}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Field
                            name={`additionalTravelers[${index}].dob`}
                            component={RenderDateField}
                            label="* Date of birth (yyyy/mm/dd)"
                            openTo="year"
                            disableFuture
                            disabled={isDisabled}
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                ))}
              </Fragment>
            )}
          />
        )}
      </Grid>
    </Grid>
  );
};

export { AdditionalTravellers };
