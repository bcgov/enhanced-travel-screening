const awsServerlessExpress = require('aws-serverless-express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const app = require('./server.js');
const { dbClient } = require('./db');

app.use(awsServerlessExpressMiddleware.eventContext());
const wrappedApp = awsServerlessExpress.createServer(app);

(async () => {
  try {
    await dbClient.connect();
  } catch (err) {
    console.log('Database Connection Failed');
    console.log(err);
  }
})();

exports.handler = (event, context) => {
  awsServerlessExpress.proxy(wrappedApp, event, context);
};
