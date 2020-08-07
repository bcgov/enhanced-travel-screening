const winston = require('winston');

const nodeEnv = process.env.NODE_ENV || 'development';

winston.add(new winston.transports.Console(nodeEnv === 'test' && { silent: true }));

module.exports = winston;
