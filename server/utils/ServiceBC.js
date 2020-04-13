const axios = require('axios');
const qs = require('querystring');
const { randomBytes } = require('crypto');
const { db, serviceBCTable } = require('../database.js');


const url = 'https://sso.pathfinder.gov.bc.ca/auth/realms/vtkayq4c/protocol/openid-connect/token';

let submitURL = 'https://test-serviceflow.pathfinder.gov.bc.ca/camunda/engine-rest/process-definition/key/covid_travel_plan_gateway/start';

if (process.env.DB_SUFFIX === 'production') { submitURL = 'https://serviceflow.pathfinder.gov.bc.ca/camunda/engine-rest/process-definition/key/covid_travel_plan_gateway/start'; }

// TODO Move to env vars
const auth = {
  username: process.env.BCS_USER,
  password: process.env.BCS_PW,
  grant_type: 'password',
  client_id: 'camunda-identity-service',
  client_secret: process.env.BCS_CLI_SECRET,
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
    return response.data;
  } catch (error) {
    const id = randomBytes(10).toString('hex').toUpperCase();
    const errorData = {
      TableName: serviceBCTable,
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
