/* eslint-disable */
const { randomBytes } = require('crypto');
const { hashPassword } = require('../../auth.js');
const { dbClient } = require('../db.js');
const { schema, collections } = require('../schema.js');

const nodeEnv = process.env.NODE_ENV || 'development';

// If run directly, will set up local DB
/* eslint-disable no-console */
(async () => {
  if (require.main === module) {
    try {
      console.log('Connecting with database server');
      await dbClient.connect();

      console.log('Checking existing collections');
      const currentCollections = await dbClient.db.listCollections().toArray();
      const collectionNames = currentCollections.map((col) => col.name);
      console.log('Existing collections are: ', collectionNames.join(', '));

      // Create collections if needed
      await Promise.all(schema.map(async (schemaItem) => {
        if (collectionNames.includes(schemaItem.collection)) return;
        console.log(`Creating collection ${schemaItem.collection}`);
        await dbClient.db.createCollection(schemaItem.collection);
      }));

      // Create collections indexes if needed
      for (const schemaItem of schema) {
        console.log(`Checking collection indexes for ${schemaItem.collection}`);
        const schemaItemCollection = dbClient.db.collection(schemaItem.collection);

        const collectionIndexes = await schemaItemCollection.listIndexes().toArray();
        const collectionIndexKeys = collectionIndexes
          .map((index) => Object.keys(index.key))
        // Flatten array
          .reduce((a, b) => a.concat(b), []);

        console.log(`Existing indexes are: ${collectionIndexKeys.join(', ')}`);

        for (const index of schemaItem.indexes) {
          if (!collectionIndexKeys.includes(index.key)) {
            console.log('Creating index', index.key);
            // Create index
            // The value for the index defines whether the index should be sorted in ascending
            // order (1) or descending order (-1)
            await schemaItemCollection.createIndex({ [index.key]: 1 }, index.options);
          }
        }
      }

      // Create local user if needed
      if (nodeEnv === 'development') {
        console.log('Verifying user');

        const usersCollection = dbClient.db.collection(collections.USERS);
        const defaultUser = await usersCollection.findOne({ username: 'username' });

        // Creates default user
        if (!defaultUser) {
          const salt = randomBytes(16).toString('hex');
          console.log('Creating default username');

          const queryResult = await usersCollection.insertOne({
            username: 'username',
            password: hashPassword('password', salt),
            salt,
          });

          console.log(`Created user 'username' with ID ${queryResult.insertedId}`);
        } else {
          console.log('Default username exists', defaultUser._id);
        }
      }

      if (nodeEnv === 'development') {
        console.log('Generate PHAC user');

        const usersCollection = dbClient.db.collection(collections.USERS);
        const defaultUser = await usersCollection.findOne({ username: 'phac' });

        // Creates default user
        if (!defaultUser) {
          const salt = randomBytes(16).toString('hex');
          console.log('Creating phac default username');

          const queryResult = await usersCollection.insertOne({
            username: 'phac',
            password: hashPassword('phac', salt),
            salt,
            type: 'phac'
          });

          console.log(`Created user 'phac' with ID ${queryResult.insertedId}`);
        } else {
          console.log('Default phac user exists', defaultUser._id);
        }
      }

      return process.exit();
    } catch (error) {
      console.error(`Failed to create collections, indexes or default username, ${error}`);
    }
  }
})();
/* eslint-enable no-console */
