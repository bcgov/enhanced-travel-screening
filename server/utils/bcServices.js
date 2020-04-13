const axios = require('axios');
const qs = require('querystring');
const { db, bcServicesTable } = require('../database.js');
const { randomBytes } = require('crypto');

const url = 'https://sso.pathfinder.gov.bc.ca/auth/realms/vtkayq4c/protocol/openid-connect/token';

let submitURL = 'https://test-serviceflow.pathfinder.gov.bc.ca/camunda/engine-rest/process-definition/key/covid_travel_plan_gateway/start';

if (process.env.DB_SUFFIX === 'production') { submitURL = 'https://serviceflow.pathfinder.gov.bc.ca/camunda/engine-rest/process-definition/key/covid_travel_plan_gateway/start'; }

// TODO Move to env vars
const auth = {
  username: 'phoct',
  password: 'yIL5432*971K',
  grant_type: 'password',
  client_id: 'camunda-identity-service',
  client_secret: '831d77fa-64dc-4f80-8eb8-960a2220aa59',
};

const getToken = async () => {
  const { data } = await axios.post(url, qs.stringify(auth), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept-Encoding': 'application/json',
    },
  });
  return data;
};

const postItem = async (item, token) => {
  try {
    const response = await axios.post(submitURL, {
      variables: {
        rawvariables: {
          value: JSON.stringify(item),
          type: 'String',
        },
      },
    }, {
      headers: {
        'Accept-Encoding': 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    const id = randomBytes(10).toString('hex').toUpperCase();
    const errorData = {
      TableName: bcServicesTable,
      Item: {
        id,
        confirmationId: item.id,
        status: 'fail',
        errorDetails: error.toJSON(),
        createdAt: new Date().toISOString(),
      },
      ConditionExpression: 'attribute_not_exists(id)',
    };
    await db.put(errorData).promise();
    return false;
  }
};

// start function call
module.exports = {
  getToken,
  postItem,
};
