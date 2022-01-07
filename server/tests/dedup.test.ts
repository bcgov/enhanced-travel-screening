import MockDate from 'mockdate';
import { join } from 'path';

import app from '../src/server';
import { dbClient, collections } from '../src/db';
import { startDB, closeDB } from './util/db';
import markDuplicates from '../src/lambda/phacToSbc/mark-duplicates';
import { sendPhacForms } from './util/feedDb';

const checkDuplicates = async (currentDate: string, mockFile: string): Promise<string> => {
  MockDate.set(currentDate);
  const fixture = join(__dirname, 'fixtures', mockFile);
  await sendPhacForms(fixture);
  const etsCollection = dbClient.db.collection(collections.FORMS);
  const phacCollection = dbClient.db.collection(collections.PHAC);
  return markDuplicates(etsCollection, phacCollection);
};

describe('Test duplication detection from the PHAC submissions', () => {
  let server;

  beforeAll(async () => {
    MockDate.set('2020-05-17');
    await startDB();
    server = app.listen();
  });

  afterAll(async () => {
    MockDate.reset();
    server.close();
    await closeDB();
  });

  it('detects duplicates by phone', async () => {
    const duplicates = await checkDuplicates('2020-04-15', 'phac-data-dedup-phone.csv');
    expect(duplicates).toMatch(/^2 duplicates within PHAC collection/gm);
  });

  it('detects duplicates by deriveTravellerKey(name, dob, arrival)', async () => {
    const duplicates = await checkDuplicates(
      '2020-05-15',
      'phac-data-dedup-derived-traveller-key.csv'
    );
    expect(duplicates).toMatch(/^3 duplicates within PHAC collection/gm);
  });

  it('detects duplicates by address and arrival date', async () => {
    const duplicates = await checkDuplicates('2020-06-15', 'phac-data-dedup-address-arrival.csv');
    expect(duplicates).toMatch(/^4 duplicates within PHAC collection/gm);
  });
});
