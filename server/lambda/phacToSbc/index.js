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
    console.log(`Marking duplicates ${Date.now()}`);
    const duplicates = await markDuplicates(etsCollection, phacCollection);
    console.log(duplicates);
    console.log(`Sending to SBC ${Date.now()}`);
    const transactions = await sendPhacToSBC(phacCollection);
    console.log(transactions);
    console.log(`Logging to Slack ${Date.now()}`);
    await postToSlack('PHAC to Service BC', start, duplicates, transactions);
  } catch (error) {
    console.error(`Failed to mark duplicates or post to SBC ${error}`);
  } finally {
    connection.close();
  }
};
