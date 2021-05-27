const awsServerlessExpress = require('aws-serverless-express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const app = require('./server.js');

app.use(awsServerlessExpressMiddleware.eventContext());
const wrappedApp = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => { awsServerlessExpress.proxy(wrappedApp, event, context); };
