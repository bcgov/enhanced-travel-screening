import { createLogger, format, transports } from 'winston';

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

export default logger;
