const app = require('./server.js');
const logger = require('./logger.js');
const { dbClient } = require('./db');

/** @type {http.Server|undefined} */
let server;

async function shutdown() { // Close server and DB connection
  await dbClient.disconnect();

  if (server) {
    server.close((err) => {
      if (err) {
        logger.error(err);
        process.exitCode = 1;
      }
      process.exit();
    });
  }
}

process.on('SIGINT', () => { // Quit on ctrl-c when running docker in terminal
  logger.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
  shutdown();
});

process.on('SIGTERM', () => { // Quit properly on docker stop
  logger.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
  shutdown();
});

(async () => { // Start server
  try {
    await dbClient.connect();
    const port = process.env.SERVER_PORT || 80;
    const host = process.env.SERVER_HOST || '0.0.0.0';
    server = app.listen(port, host, async () => {
      logger.info(`Listening on port ${port}`);
    });
  } catch (err) {
    logger.error(err);
    shutdown();
  }
})();

module.exports = server;
