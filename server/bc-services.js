const axios = require('axios');
const qs = require('querystring');
const express = require('express');
const app = express();

const url = 'https://sso.pathfinder.gov.bc.ca/auth/realms/vtkayq4c/protocol/openid-connect/token';
const submitURL = 'https://test-serviceflow.pathfinder.gov.bc.ca/camunda/engine-rest/process-definition/key/covid_travel_plan_gateway/start';
const data = {
  username: 'phoct',
  password: 'yIL5432*971K',
  grant_type: 'password',
  client_id: 'camunda-identity-service',
  client_secret: '831d77fa-64dc-4f80-8eb8-960a2220aa59',
};

const dbData = {
  accommodationAssistance: true,
  accommodations: true,
  additionalTravellers: [
    {
      dob: '1999/03/27',
      firstName: 'Johnny',
      lastName: 'Cena',
    },
  ],
  address: '1234 Fake St.',
  arrival: {
    by: 'air',
    date: '2020/04/13',
    flight: null,
    from: 'Wuhan,China',
  },
  certified: true,
  city: 'Victoria',
  determination: null,
  dob: '1999/03/27',
  email: null,
  firstName: 'John',
  id: '049553D2',
  includeAdditionalTravellers: true,
  isolationPlan: {
    address: '1234 Fake St.',
    city: 'Vctoria',
    type: 'family'
  },
  lastName: 'Cena',
  notes: null,
  postalCode: 'A1A1A1',
  province: 'Yukon',
  supplies: true,
  telephone: '1234567890',
  transportation: [
    'taxi',
    'personal',
    'public',
  ],
};

const postData = (db_data, token) => {
  axios.post(submitURL, db_data, {
    headers: {
      'Accept-Encoding': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  })
    .then((response) => {
      console.log(response.data.id);
    })
    .catch((error) => {
      console.log(error.toJSON());
    });
};

(async () => {
  axios.post(url, qs.stringify(data), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept-Encoding': 'application/json',
    },
  })
    .then((response) => {
      if (response.data.access_token) {
        app.set('service_token', response.data.access_token);
        app.set('expires_in', Date.now() + response.data.expires_in);
      }
      postData({
        variables: {
          rawvariables: {
            value: JSON.stringify(dbData),
            type: 'String',
          },
        },
      },
      response.data.access_token);
    })
    .catch((error) => {
      console.log(error);
    });
  
})();
