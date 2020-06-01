const { CronJob } = require('cron');
const logger = require('./logger.js');
const { dbClient, collections } = require('./db');
const { getUnsuccessfulSbcTransactions, updateSbcTransactions } = require('./utils/sbc-phac-queries');
const { postServiceItem } = require('./utils/service-bc');

const postToSbcAndUpdateDb = async (collection, submission) => {
  const transaction = await postServiceItem(submission);
  await updateSbcTransactions(collection, submission.id, transaction);
  return { id: submission.id, status: transaction.status };
};

const etsToSbcJob = async () => {
  const currentDate = new Date().toISOString();
  logger.info('ets to sbc cron job executed', currentDate);
  try {
    const etsCollection = dbClient.db.collection(collections.FORMS);
    try {
      let data = await getUnsuccessfulSbcTransactions(etsCollection);
      // Remove SBC transactions from submission
      data = data.map((d) => {
        const { serviceBCTransactions, ...rest } = d;
        return rest;
      });
      const promises = data.map((d) => postToSbcAndUpdateDb(etsCollection, d));
      // Wait for all SBC and associated DB interactions to complete
      const results = await Promise.all(promises);
      logger.info(results, currentDate);
      console.log(results);
    } catch (error) {
      logger.error(`Failed one or more SBC transactions: ${error}`, currentDate);
      console.log(`Failed one or more SBC transactions: ${error}`);
    }
  } catch (error) {
    logger.error(`Failed to establish DB connection: ${error}`, currentDate);
    console.log(`Failed to establish DB connection: ${error}`);
  }
};

const phacToSbcJob = async () => {
  const currentDate = new Date().toISOString();
  logger.info('phac to sbc cron job executed', currentDate);
  // TODO run phac to sbc logic
};

const initCronJobs = () => {
  const timezone = 'America/Los_Angeles';
  const cronTime = '0 59 23 * * *'; // 23:59:00

  (new CronJob(cronTime, phacToSbcJob, null, false, timezone)).start();
  (new CronJob(cronTime, etsToSbcJob, null, false, timezone)).start();
};

module.exports = {
  initCronJobs,
  etsToSbcJob,
};
