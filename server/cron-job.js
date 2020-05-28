const { CronJob } = require('cron');
const logger = require('./logger.js');

const initCronJobs = () => {
  const timezone = 'America/Los_Angeles';
  const cronTime = '0 59 23 * * *'; // 23:59:00

  const phacToSbc = new CronJob(cronTime, () => {
    const currentDate = new Date().toISOString();
    logger.info('phac to sbc cron job executed', currentDate);
    // TODO run phac to sbc logic
  }, null, false, timezone);
  phacToSbc.start();
};

module.exports = initCronJobs;
