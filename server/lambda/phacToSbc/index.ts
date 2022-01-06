/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
import { sendPhacToSBC } from 'custom_modules/send-to-sbc';

import postToSlack from 'custom_modules/post-to-slack';
import dbConnectionAndCollections from 'custom_modules/db';
import logger from 'custom_modules/logger';
import markDuplicates from './mark-duplicates';

/* eslint-disable no-console */

export const handler = async () => {
  const start = new Date().getTime();
  const { connection, collections } = await dbConnectionAndCollections([
    'ets-forms',
    'ets-phac',
  ]);
  const [etsCollection, phacCollection] = collections;
  try {
    logger.info('STARTING: Mark duplicates');
    const duplicates = await markDuplicates(etsCollection, phacCollection);
    logger.info('FINISHED: Marking duplicates');
    // markDuplicates output is the below log
    logger.info(duplicates);
    logger.info('STARTING: Send to SBC');
    const transactions = await sendPhacToSBC(phacCollection);
    logger.info(transactions);
    logger.info('FINISHED: Logging to Slack');
    await postToSlack('PHAC to Service BC', start, duplicates, transactions);
  } catch (error) {
    logger.error(`FAILED: Marking duplicates or post to SBC ${error}`);
  } finally {
    connection.close();
  }
};
