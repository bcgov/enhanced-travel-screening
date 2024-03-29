import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const nodeEnv = process.env.NODE_ENV || 'development';
const dateInTimezone = () => {
  const offset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - offset).toISOString().substring(0, 10);
};

if (!['development', 'test'].includes(nodeEnv)) {
  winston.add(
    new WinstonCloudWatch({
      name: 'server-logs',
      logGroupName: process.env.DB_NAME, // Group logs by deployment environment
      logStreamName: dateInTimezone, // Group logs by date
      awsRegion: 'ca-central-1',
    })
  );
}

winston.add(
  new winston.transports.Console(
    nodeEnv === 'test' && {
      silent: true,
      format: winston.format.colorize(),
    }
  )
);

export default winston;
