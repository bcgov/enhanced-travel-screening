/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
import { sendEtsToSBC } from 'custom_modules/send-to-sbc';

import postToSlack from 'custom_modules/post-to-slack';
import dbConnectionAndCollections from 'custom_modules/db';

/* eslint-disable no-console */

export const handler = async () => {
  const start = new Date().getTime();
  const { connection, collections } = await dbConnectionAndCollections([
    'ets-forms',
  ]);
  const [etsCollection] = collections;
  try {
    const transactions = await sendEtsToSBC(etsCollection);
    console.log(transactions);
    await postToSlack('ETS to Service BC', start, transactions);
  } catch (error) {
    console.error(`Failed to post to SBC ${error}`);
  } finally {
    connection.close();
  }
};
