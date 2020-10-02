// const { sendPhacToSBC } = require('./common/send-to-sbc');
const markDuplicates = require('./common/mark-duplicates');
// const postToSlack = require('./common/post-to-slack');
const dbConnectionAndCollections = require('./common/db');

(async () => {
  // const start = new Date().getTime();
  const { tunnel, connection, collections } = await dbConnectionAndCollections(['ets-forms', 'ets-phac']);
  const [etsCollection, phacCollection] = collections;
  try {
    const duplicates = await markDuplicates(etsCollection, phacCollection);
    console.log(duplicates);
    // const transactions = await sendPhacToSBC(phacCollection);
    // console.log(transactions);
    // await postToSlack('PHAC to Service BC (OCP)', start, duplicates, transactions);
    const etsCount = await etsCollection.countDocuments({});
    const phacCount = await phacCollection.countDocuments({});
    console.log(etsCount, phacCount);
  } catch (error) {
    console.error(`Failed to mark duplicates or post to SBC ${error}`);
  } finally {
    connection.close();
    tunnel.close();
  }
})();
