const { dbClient, schema, collections } = require('../../db');
const { randomBytes } = require('crypto');
const { hashPassword } = require('../../auth.js');

async function seedDatabase() {
    // Create collections if needed
    await Promise.all(schema.map(async (schemaItem) => {
        await dbClient.db.createCollection(schemaItem.collection);
    }));

    // Create collection indexes if needed
    for (const schemaItem of schema) {
        const schemaItemCollection = dbClient.db.collection(schemaItem.collection);

        for (const index of schemaItem.indexes) {
            await schemaItemCollection.createIndex({ [index.key]: 1 }, index.options);
        }
    }

    // Create default user
    const usersCollection = dbClient.db.collection(collections.USERS);
    const salt = randomBytes(16).toString('hex');
    await usersCollection.insertOne({
        username: 'username',
        password: hashPassword('password', salt),
        salt,
    });
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

async function clearDB() {
    const collections = await dbClient.db.collections();

    for (const collection of collections) {
      await collection.deleteOne()
    }
}

async function closeDB() {
    await dbClient.disconnect();
    await clearDB();
}

module.exports = {
    seedDatabase,
    startDB,
    closeDB,
}