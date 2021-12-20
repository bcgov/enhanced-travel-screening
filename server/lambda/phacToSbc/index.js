/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
const { sendPhacToSBC } = require('custom_modules/send-to-sbc');
const postToSlack = require('custom_modules/post-to-slack');
const dbConnectionAndCollections = require('custom_modules/db');
const markDuplicates = require('./mark-duplicates');

/* eslint-disable no-console */

exports.handler = async () => {
  const start = new Date().getTime();
  const { connection, collections } = await dbConnectionAndCollections(['ets-forms', 'ets-phac']);
  const [etsCollection, phacCollection] = collections;
  try {
    console.log(`STARTING: Mark duplicates ${new Date().toISOString()}`);
    const duplicates = await markDuplicates(etsCollection, phacCollection);
    console.log(`FINISHED: Marking duplicates ${new Date().toISOString()}`);
    // markDuplicates output is the below log
    console.log(duplicates);

    console.log(`STARTING: Send to SBC ${new Date.toISOString()}`);
    const transactions = await sendPhacToSBC(phacCollection);
    console.log(transactions);
    console.log(`FINISHED: Logging to Slack ${new Date.toISOString()}`);
    await postToSlack("PHAC to Service BC", start, duplicates, transactions);
  } catch (error) {
    console.error(`FAILED: Marking duplicates or post to SBC ${error}`);
  } finally {
    connection.close();
  }
};
