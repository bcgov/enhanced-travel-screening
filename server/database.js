const AWS = require('aws-sdk');
const schema = require('./schema.js');

// Run DynamoDB locally: docker run -p 8000:8000 amazon/dynamodb-local
AWS.config.update({ region: 'ca-central-1', endpoint: 'http://localhost:8000' });
const db = new AWS.DynamoDB();
const dbClient = new AWS.DynamoDB.DocumentClient();

// If run directly, will set up local DB
(async () => {
  if (require.main === module) {
    const tables = await db.listTables().promise();
    if (Array.isArray(tables.TableNames) && tables.TableNames.length > 0) return; // Tables exist
    schema.forEach(async (s) => {
      await db.createTable(s).promise();
    });
    const item = {
      TableName: 'credentials',
      Item: {
        id: 'ashtonmeuser',
        password: 'password',
      },
    };
    await dbClient.put(item).promise();
  }
})();

module.exports = dbClient;
