import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import app from './server';
import { dbClient } from './db';

app.use(awsServerlessExpressMiddleware.eventContext());
const wrappedApp = awsServerlessExpress.createServer(app);

(async () => {
  try {
    const connection = await dbClient.connect();
    console.log('connection success', connection);
  } catch (err) {
    console.log('Database Connection Failed');
    console.log(err);
  }
})();

export const handler = (event, context) => {
  awsServerlessExpress.proxy(wrappedApp, event, context);
};
