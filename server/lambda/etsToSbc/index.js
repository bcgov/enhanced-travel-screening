/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
const { sendEtsToSBC } = require('custom_modules/send-to-sbc');
const dbConnectionAndCollections = require('custom_modules/db');

/* eslint-disable no-console */

exports.handler = async () => {
  const { connection, collections } = await dbConnectionAndCollections(['ets-forms']);
  const [etsCollection] = collections;
  try {
    const transactions = await sendEtsToSBC(etsCollection);
    console.log(transactions);
  } catch (error) {
    console.error(`Failed to post to SBC ${error}`);
  } finally {
    connection.close();
  }
};
