const { CronJob } = require('cron');
const logger = require('./logger.js');
const { dbClient, collections } = require('./db');
const { getUnsuccessfulSbcTransactions, updateSbcTransactions } = require('./utils/sbc-phac-queries');
const { postServiceItem } = require('./utils/service-bc');
const { sendPhacToSBC } = require('./utils/sbc-phac');
const { runTaskOnMaster } = require('./utils/aws-services');

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
      await Promise.all(promises);
    } catch (error) {
      logger.error(`Failed one or more SBC transactions: ${error}`, currentDate);
    }
  } catch (error) {
    logger.error(`Failed to establish DB connection: ${error}`, currentDate);
  }
};

const phacToSbcJob = async () => {
  if (process.env.ENABLE_PHAC_CRONJOB !== 'true') return;
  const currentDate = new Date().toISOString();
  logger.info('phac to sbc cron job executed', currentDate);
  try {
    const results = sendPhacToSBC();
    logger.info(`Sent ${results.length} PHAC record(s) to SBC`);
  } catch (error) {
    logger.error(`Failed to send PHAC records to SBC ${error}`);
  }
};

const startCronJobOnMaster = (cronTime, job, timezone) => {
  (new CronJob(cronTime, () => { runTaskOnMaster(job); }, null, false, timezone)).start();
};

const initCronJobs = () => {
  const timezone = 'America/Los_Angeles';
  const cronTime = '00 10 13 * * *';

  startCronJobOnMaster(cronTime, phacToSbcJob, timezone);
  startCronJobOnMaster(cronTime, etsToSbcJob, timezone);
};

module.exports = {
  initCronJobs,
  etsToSbcJob,
};
