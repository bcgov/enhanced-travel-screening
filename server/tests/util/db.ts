import { randomBytes } from 'crypto';
import { dbClient, schema, collections, TEST_DB } from '../../src/db';
import { hashPassword } from '../../src/auth';

async function seedDatabase() {
  // Create collections if needed
  await Promise.all(
    schema.map(async schemaItem => {
      await dbClient.db.createCollection(schemaItem.collection);
    })
  );

  // Create collection indexes if needed
  const results = [];
  for (const schemaItem of schema) {
    // eslint-disable-line no-restricted-syntax
    const schemaItemCollection = dbClient.db.collection(schemaItem.collection);
    for (const index of schemaItem.indexes) {
      // eslint-disable-line no-restricted-syntax
      // eslint-disable-next-line no-await-in-loop
      const indexExists = await schemaItemCollection.indexExists(index.key);
      if (!indexExists) {
        results.push(schemaItemCollection.createIndex({ [index.key]: 1 }, index.options));
      }
    }
  }

  await Promise.all(results); // Wait for all synchronous operations to pass/fail

  // Create default users
  const usersCollection = dbClient.db.collection(collections.USERS);
  const salt = randomBytes(16).toString('hex');
  await usersCollection.insertOne({
    username: 'username',
    password: hashPassword('password', salt),
    salt,
  });
  await usersCollection.insertOne({
    username: 'username_phac',
    password: hashPassword('password', salt),
    salt,
    type: 'phac',
  });
}

async function clearDB() {
  dbClient.useDB(TEST_DB);
  await dbClient.db.dropDatabase();
}

/**
 * Connect to Mongo DB, and seed it
 */
async function startDB() {
  await dbClient.connect();
  dbClient.useDB(TEST_DB);
  await clearDB();
  await seedDatabase();
}

async function closeDB() {
  await clearDB();
  await dbClient.disconnect();
}

export { seedDatabase, startDB, closeDB };
