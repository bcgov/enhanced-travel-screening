const request = require('supertest');
const { readFileSync } = require('fs');
const { join } = require('path');
const app = require('../server');
const { getArrivalUnsuccessfulSbcTransactions, getUnsuccessfulSbcTransactions } = require('../utils/sbc-phac-queries');
const { dbClient, collections, TEST_DB } = require('../db');
const { startDB, closeDB } = require('./util/db');
const { fromCsvString } = require('./util/csv');
const { etsToSbcJob } = require('../cron-job');

const formatHeaders = (csvString) => {
  const rows = csvString.split(/\r?\n/g);
  rows[0] = rows[0]
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, '_');
  return rows.join('\n'); // Replace line breaks with UNIX style
};

const failSbcSubmissions = 3;

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
          status: index >= failSbcSubmissions ? 'success' : 'fail',
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

  const currentDate = '2020-05-26'; // Must match current date which CSV files are based on

  async function sendPhacForms() {
    let phacDataString = readFileSync(join(__dirname, './mock/phac-data.csv')).toString();
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
    const resPhacForms = await sendPhacForms();
    expect(resPhacForms.statusCode).toEqual(200);
  });

  it('Should NOT send records beyond end of quarantine period from PHAC to Service BC', async () => {
    dbClient.useDB(TEST_DB);
    const phacCollection = dbClient.db.collection(collections.PHAC);
    const itemsToSend = await getArrivalUnsuccessfulSbcTransactions(phacCollection, currentDate);
    const count = await phacCollection.countDocuments();
    const testTargets = ['CVR-0159105', 'CVR-0159108', 'CVR-0159102', 'CVR-0159103'];
    expect(itemsToSend.filter((item) => testTargets.includes(item.covid_id)).length).toEqual(0);
    expect(itemsToSend.length).toEqual(count - testTargets.length);
  });

  it('Send unsuccessful Service BC transactions again', async () => {
    dbClient.useDB(TEST_DB);
    const etsCollection = dbClient.db.collection(collections.FORMS);
    const failData = await getUnsuccessfulSbcTransactions(etsCollection);
    expect(failData.length).toEqual(failSbcSubmissions);
    await etsToSbcJob();
    const newFailData = await getUnsuccessfulSbcTransactions(etsCollection);
    expect(newFailData.length).toEqual(0);
  });

  afterAll(() => {
    server.close();
  });
});
