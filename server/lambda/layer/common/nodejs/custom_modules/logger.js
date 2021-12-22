const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      colorize: true,
      format: winston.format.simple(),
    }),
  ],
});

module.exports = logger;
