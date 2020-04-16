const AWS = require('aws-sdk');
const { randomBytes } = require('crypto');
const { hashPassword } = require('./auth.js');
const schema = require('./schema.js');

// Run DynamoDB locally: docker run -p 8000:8000 amazon/dynamodb-local
const databaseSuffix = process.env.NODE_ENV === 'test' ? 'test' : process.env.DB_SUFFIX || 'development';
const nodeEnv = process.env.NODE_ENV || 'development';
AWS.config.update({
  region: 'ca-central-1',
  ...((nodeEnv === 'development' || nodeEnv === 'test') && { endpoint: 'http://localhost:8000' }),
});
const db = new AWS.DynamoDB();
const dbClient = new AWS.DynamoDB.DocumentClient();

// If run directly, will set up local DB
/* eslint-disable no-console */
(async () => {
  if (require.main === module) {
    try {
      console.log('Checking for DB tables');
      const tables = await db.listTables().promise();
      if (nodeEnv !== 'development' && nodeEnv !== 'test') {
        console.error('Environment variable NODE_ENV must be set to either development or test');
        return;
      }
      if (Array.isArray(tables.TableNames) && tables.TableNames.length > 0) {
        console.log('DB tables already exist');
        return;
      }
      schema.forEach(async (s) => {
        console.log(`Creating table ${s.TableName}`);
        await db.createTable(s).promise();
      });
      console.log('Waiting 10s for tables to be created');
      await (async (ms = 10000) => new Promise((resolve) => setTimeout(resolve, ms)))();
      const salt = randomBytes(16).toString('hex');
      const item = {
        TableName: `ets-users-${databaseSuffix}`,
        Item: {
          id: 'username',
          password: hashPassword('password', salt),
          salt,
        },
      };
      console.log(`Creating user with ID ${item.Item.id} in table ${item.TableName}`);
      await dbClient.put(item).promise();
    } catch (error) {
      console.error(`Failed to create tables and/or user ${error}`);
    }
  }
})();
/* eslint-enable no-console */

module.exports = {
  db: dbClient,
  usersTable: `ets-users-${databaseSuffix}`,
  formsTable: `ets-forms-${databaseSuffix}`,
  serviceBCTable: `ets-servicebc-${databaseSuffix}`,
};
