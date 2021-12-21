const request = require('supertest');
const { readFileSync } = require('fs');
const { join } = require('path');
const MockDate = require('mockdate');
const app = require('../server');
const { dbClient, collections, TEST_DB } = require('../db');
const { startDB, closeDB } = require('./util/db');
const { fromCsvString } = require('./util/csv');
const markDuplicates = require('../lambda/phacToSbc/mark-duplicates');
const { sendPhacToSBC, sendEtsToSBC } = require('../lambda/layer/common/nodejs/custom_modules/send-to-sbc');

jest.setTimeout(600000);

const formatHeaders = (csvString) => {
  const rows = csvString.split(/\r?\n/g);
  rows[0] = rows[0]
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, '_');
  return rows.join('\n'); // Replace line breaks with UNIX style
};

const failSbcSubmissionsCount = 3;

describe('Test phac-servicebc queries and endpoints', () => {
  let server;

  async function feedDbEtsForms() {
    let etsDataString = readFileSync(join(__dirname, './mock/ets-data.csv')).toString();
    etsDataString = formatHeaders(etsDataString);
    const etsData = await fromCsvString(etsDataString);
    const currentIsoDate = new Date().toISOString();
    const formattedEtsData = etsData.map((item, index) => ({
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
          status: index >= failSbcSubmissionsCount ? 'success' : 'fail',
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
  }

  beforeEach(() => {
    MockDate.set('2020-05-17');
  });

  afterEach(() => {
    MockDate.reset();
  });

  beforeAll(async () => {
    await startDB();
    server = app.listen();
    await feedDbEtsForms();
  });

  afterAll(async () => {
    await closeDB();
  });

  const loginEndpoint = '/api/v1/login';
  const phacEndpoint = '/api/v1/phac/submission';

  const user = {
    username: 'username_phac',
    password: 'password',
  };

  async function sendPhacForms(mockFile) {
    let phacDataString = readFileSync(join(__dirname, mockFile)).toString();
    phacDataString = formatHeaders(phacDataString);
    const phacData = await fromCsvString(phacDataString);

    const resLogin = await request.agent(app)
      .post(loginEndpoint)
      .send(user);

    return request.agent(app)
      .set({ Accept: 'application/json', 'Content-type': 'application/json', Authorization: `Bearer ${resLogin.body.token}` })
      .post(phacEndpoint)
      .send(phacData);
  }

  it('Submit PHAC data to PHAC endpoint, receive 200', async () => {
    const resPhacForms = await sendPhacForms('./mock/phac-data.csv');
    expect(resPhacForms.statusCode).toEqual(200);
  });

  it('Reject submission with invalid data of birth', async () => {
    const result = await sendPhacForms('./mock/phac-data-invalid-dob.csv');
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual('Validation error(s): Date of birth is invalid');
  });

  it('Reject submission with invalid arrival date', async () => {
    const result = await sendPhacForms('./mock/phac-data-invalid-arrival.csv');
    expect(result.statusCode).toEqual(400);
    expect(result.text).toEqual('Validation error(s): Arrival date is invalid');
  });

  it('Reject submission with invalid phone numbers', async () => {
    const result = await sendPhacForms('./mock/phac-data-invalid-phone.csv');
    expect(result.statusCode).toEqual(400);
    expect(result.text).toMatch(/Validation error\(s\): .*phone is invalid/);
  });

  it('Test PHAC to ServiceBC function, match logs', async () => {
    dbClient.useDB(TEST_DB);
    const etsCollection = dbClient.db.collection(collections.FORMS);
    const phacCollection = dbClient.db.collection(collections.PHAC);
    const duplicates = await markDuplicates(etsCollection, phacCollection);
    expect(duplicates).toMatch(/^5 duplicates within ETS collection/gm);
    expect(duplicates).toMatch(/^1 duplicates within PHAC collection/gm);
    const transactions = await sendPhacToSBC(phacCollection);
    expect(transactions).toMatch(/^0 success\(es\)/gm);
    expect(transactions).toMatch(/^0 failure\(s\)/gm);
  });

  it('Test ETS to ServiceBC function, match logs', async () => {
    dbClient.useDB(TEST_DB);
    const etsCollection = dbClient.db.collection(collections.FORMS);
    const transactions = await sendEtsToSBC(etsCollection);
    expect(transactions).toMatch(/^0 success\(es\)/gm);
    expect(transactions).toMatch(/^0 failure\(s\)/gm);
  });

  afterAll(() => {
    server.close();
  });
});
