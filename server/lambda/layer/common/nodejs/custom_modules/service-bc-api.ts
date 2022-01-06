import axios from 'axios';
import qs from 'querystring';
import NodeCache from 'node-cache';

const tokenUrl = `https://${
  process.env.DB_NAME === 'ets-prod' ? '' : 'test.'
}oidc.gov.bc.ca/auth/realms/vtkayq4c/protocol/openid-connect/token`;
const submitURL = `https://${
  process.env.DB_NAME === 'ets-prod'
    ? 'sbc-ffa-bpm.servicebc'
    : 'test-sbc-ffa-bpm.apps.silver.devops'
}.gov.bc.ca/camunda/engine-rest/process-definition/key/covid_travel_plan_gateway/start`;
const appCache = new NodeCache();

const auth = {
  username: process.env.SBC_USER,
  password: process.env.SBC_PW,
  grant_type: 'password',
  client_id: 'camunda-identity-service',
  client_secret: process.env.SBC_CLI_SECRET,
};

const getToken = async () => {
  if (appCache.get('ServiceBCToken') !== undefined)
    return appCache.get('ServiceBCToken');

  const { data } = await axios.post(tokenUrl, qs.stringify(auth), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept-Encoding': 'application/json',
    },
  });

  appCache.set('ServiceBCToken', data.access_token, data.expires_in - 10);
  return data.access_token;
};

const postServiceItem = async (item) => {
  const token = await getToken();
  const response = await axios.post(
    submitURL,
    {
      variables: {
        rawvariables: {
          value: JSON.stringify(item),
          type: 'String',
        },
      },
    },
    {
      headers: {
        'Accept-Encoding': 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return {
    status: 'success',
    serviceBCId: response.data.id,
    processedAt: new Date().toISOString(),
  };
};

export { postServiceItem };
