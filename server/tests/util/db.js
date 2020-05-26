const { randomBytes } = require('crypto');
const { readFileSync } = require('fs');
const { join } = require('path');
const { dbClient, schema, collections } = require('../../db');
const { hashPassword } = require('../../auth.js');
const { fromCsvString } = require('./csv.js');

const formatHeaders = (csvString) => {
  const rows = csvString.split(/\r?\n/g);
  rows[0] = rows[0]
    .toLowerCase()
    .trim()
    .replace(/[\s/]+/g, '_');
  return rows.join('\n'); // Replace line breaks with UNIX style
};

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

  // Create default user
  const usersCollection = dbClient.db.collection(collections.USERS);
  const salt = randomBytes(16).toString('hex');
  await usersCollection.insertOne({
    username: 'username',
    password: hashPassword('password', salt),
    salt,
  });
}

async function seedCsvIntoDatabase() {
  // let etsDataString = readFileSync(join(__dirname, '../mock/ets-data.csv')).toString();
  // etsDataString = formatHeaders(etsDataString);

  let phacDataString = readFileSync(join(__dirname, '../mock/phac-data.csv')).toString();
  phacDataString = formatHeaders(phacDataString);

  const phacData = await fromCsvString(phacDataString);
  const usersCollection = dbClient.db.collection(collections.PHAC);
  await usersCollection.insertMany(phacData);
}

async function clearDB() {
  const collectionsToDelete = await dbClient.db.collections();

  const results = [];
  collectionsToDelete.forEach((collection) => {
    results.push(collection.deleteOne());
  });

  return Promise.all(results); // Wait for all synchronous operations to pass/fail
}

/**
 * Connect to Mongo DB, and seed it
 */
async function startDB() {
  await dbClient.connect();
  dbClient.useDB('TEST_DB');
  await clearDB();
  await seedDatabase();
}

async function closeDB() {
  await dbClient.disconnect();
  await clearDB();
}

module.exports = {
  seedCsvIntoDatabase,
  seedDatabase,
  startDB,
  closeDB,
};
