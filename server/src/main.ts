import app from './server';
import logger from './logger';
import { dbClient } from './db';

const port = 80;

/** @type {http.Server|undefined} */
let server;

async function shutdown() {
  // Close server and DB connection
  await dbClient.disconnect();

  if (server) {
    server.close(err => {
      if (err) {
        logger.error(err);
        process.exitCode = 1;
      }
      process.exit();
    });
  }
}

process.on('SIGINT', () => {
  // Quit on ctrl-c when running docker in terminal
  logger.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
  shutdown();
});

process.on('SIGTERM', () => {
  // Quit properly on docker stop
  logger.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
  shutdown();
});

(async () => {
  // Start server
  try {
    await dbClient.connect();
    server = app.listen(port, async () => {
      logger.info(`Listening on port ${port}`);
    });
  } catch (err) {
    logger.error(err);
    shutdown();
  }
})();

export default server;
