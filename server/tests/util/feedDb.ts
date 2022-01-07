import request from 'supertest';
import { readFileSync } from 'fs';
import { fromCsvString } from './csv';
import app from '../../src/server';
import { collections, dbClient, TEST_DB } from '../../src/db';

const loginEndpoint = '/api/v1/login';
const phacEndpoint = '/api/v1/phac/submission';

const user = {
  username: 'username_phac',
  password: 'password',
};

export const formatHeaders = (csvString): string => {
  const rows = csvString.split(/\r?\n/g);
  rows[0] = rows[0]
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, '_');
  return rows.join('\n'); // Replace line breaks with UNIX style
};

export const sendPhacForms = async mockFile => {
  const phacData = await fromCsvString(formatHeaders(readFileSync(mockFile).toString()));

  const resLogin = await request.agent(app).post(loginEndpoint).send(user);

  return request
    .agent(app)
    .set({
      Accept: 'application/json',
      'Content-type': 'application/json',
      Authorization: `Bearer ${resLogin.body.token}`,
    })
    .post(phacEndpoint)
    .send(phacData);
};

export const feedDbEtsForms = async (mockFile: string, failureCount: number) => {
  const etsData = await fromCsvString(formatHeaders(readFileSync(mockFile).toString()));
  const currentIsoDate = new Date().toISOString();
  const formattedEtsData = etsData?.map((item, index) => ({
    id: item.confirmation_number,
    firstName: item.first_name,
    lastName: item.last_name,
    dob: item.date_of_birth,
    telephone: item.phone_number,
    email: item.email,
    address: item.home_address,
    city: item.city,
    postalCode: item.postal_code,
    province: item.province,
    arrival: {
      date: item.arrival_date,
      by: item.arrival_by,
      flight: item.airline_flight_number,
      from: item.arrival_from,
    },
    serviceBCTransactions: [
      {
        status: index >= failureCount ? 'success' : 'fail',
        processedAt: currentIsoDate,
      },
    ],
    certified: true,
    createdAt: currentIsoDate,
    updatedAt: currentIsoDate,
  }));

  dbClient.useDB(TEST_DB);
  const formsCollection = dbClient.db.collection(collections.FORMS);
  return formsCollection.insertMany(formattedEtsData);
};
