import { join } from 'path';
import MockDate from 'mockdate';
import { sendPhacToSBC, sendEtsToSBC } from 'custom_modules/send-to-sbc';

import app from '../src/server';
import { dbClient, collections, TEST_DB } from '../src/db';
import { startDB, closeDB } from './util/db';
import { sendPhacForms, feedDbEtsForms } from './util/feedDb';
import markDuplicates from '../src/lambda/phacToSbc/mark-duplicates';

const failSbcSubmissionsCount = 3;

describe('Test phac-servicebc queries and endpoints', () => {
  let server;

  beforeAll(async () => {
    MockDate.set('2020-05-17');
    await startDB();
    server = app.listen();
    await feedDbEtsForms(join(__dirname, 'fixtures', 'ets-data.csv'), failSbcSubmissionsCount);
  });

  afterAll(async () => {
    MockDate.reset();
    server.close();
    await closeDB();
  });

  it('Submit PHAC data to PHAC endpoint, receive 200', async () => {
    const fixture = join(__dirname, './fixtures/phac-data.csv');
    const resPhacForms = await sendPhacForms(fixture);
    expect(resPhacForms.statusCode).toEqual(200);
  });

  it('Validates submissions and returns all errors', async () => {
    const fixture = join(__dirname, './fixtures/phac-data-invalid.csv');
    const result = await sendPhacForms(fixture);
    expect(result.statusCode).toEqual(400);
    expect(result.text).toMatch(/later than arrival date/);
    expect(result.text).toMatch(/phone number is invalid/);
    expect(result.text).toMatch(/Arrival date is invalid/);
    expect(result.text).toMatch(/Date of birth is invalid/);
    expect(result.text).toMatch(/phone number is required/);
  });

  it('Test PHAC to ServiceBC function, match logs', async () => {
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
});
