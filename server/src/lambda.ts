import awsServerlessExpress from 'aws-serverless-express';
import awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';
import app from './server';
import { dbClient } from './db';
import logger from './logger';

app.use(awsServerlessExpressMiddleware.eventContext());
const wrappedApp = awsServerlessExpress.createServer(app);

(async () => {
  try {
    const connection = await dbClient.connect();
    logger.info('connection success', connection);
  } catch (err) {
    logger.error('Database Connection Failed');
    logger.error(err);
  }
})();

export const handler = (event, context) => {
  awsServerlessExpress.proxy(wrappedApp, event, context);
};
