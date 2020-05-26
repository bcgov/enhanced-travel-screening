const app = require('../server');
const { startDB, closeDB, seedCsvIntoDatabase } = require('./util/db');


describe('Unit test phac-servicebc compliance functions', () => {
  let server;

  beforeAll(async () => {
    await startDB();
    server = app.listen();
    await seedCsvIntoDatabase();
  });

  afterAll(async () => {
    await closeDB();
  });

  it('Should NOT send post dated arrival PHAC record to Service BC', async () => {


  });

  afterAll(() => {
    server.close();
  });
});
