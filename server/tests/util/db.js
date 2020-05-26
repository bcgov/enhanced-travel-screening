const { randomBytes } = require('crypto');
const { dbClient, schema, collections } = require('../../db');
const { hashPassword } = require('../../auth.js');

async function seedDatabase() {
  // Create collections if needed
  await Promise.all(schema.map(async (schemaItem) => {
    await dbClient.db.createCollection(schemaItem.collection);
  }));

  // Create collection indexes if needed
  const results = [];
  schema.forEach((schemaItem) => {
    const schemaItemCollection = dbClient.db.collection(schemaItem.collection);
    schemaItem.indexes.forEach((index) => {
      results.push(schemaItemCollection.createIndex({ [index.key]: 1 }, index.options));
    });
  });

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
  dbClient.useDB('TEST_DB');
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
  await dbClient.disconnect();
  await clearDB();
}

module.exports = {
  seedDatabase,
  startDB,
  closeDB,
};
