/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
const { sendPhacToSBC } = require('custom_modules/send-to-sbc');
const postToSlack = require('custom_modules/post-to-slack');
const dbConnectionAndCollections = require('custom_modules/db');
const markDuplicates = require('./mark-duplicates');

/* eslint-disable no-console */

exports.handler = async () => {
  const { connection, collections } = await dbConnectionAndCollections(['ets-forms', 'ets-phac']);
  const [etsCollection, phacCollection] = collections;
  try {
    const duplicates = await markDuplicates(etsCollection, phacCollection);
    console.log(duplicates);
    const transactions = await sendPhacToSBC(phacCollection);
    console.log(transactions);
    await postToSlack(`${duplicates}\n${transactions}`);
  } catch (error) {
    console.error(`Failed to mark duplicates or post to SBC ${error}`);
  } finally {
    connection.close();
  }
};
