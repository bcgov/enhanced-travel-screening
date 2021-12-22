const { createLogger, format, transports } = require('winston');

const { combine, timestamp, json } = format;

const logger = createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    json(),
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
