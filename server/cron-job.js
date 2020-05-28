const { CronJob } = require('cron');
const logger = require('./logger.js');

const initCronJobs = () => {
  const timezone = 'America/Los_Angeles';
  const cronTime = '0 59 23 * * *'; // 23:59:00

  CronJob(cronTime, () => {
    const currentDate = new Date().toISOString();
    logger.info('phac-sbc cron job executed', currentDate);

    // TODO run phac -> sbc logic
  }, null, true, timezone);
};

module.exports = initCronJobs;
