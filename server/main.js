const app = require('./server.js');
const logger = require('./logger.js');

const port = 80;

const server = app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});

module.exports = server;
