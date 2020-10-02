// const { sendPhacToSBC } = require('./common/send-to-sbc');
const markDuplicates = require('./common/mark-duplicates');
// const postToSlack = require('./common/post-to-slack');
const dbConnectionAndCollections = require('./common/db');

(async () => {
  // const start = new Date().getTime();
  const { tunnel, connection, collections } = await dbConnectionAndCollections(['ets-forms', 'ets-phac']);
  const [etsCollection, phacCollection] = collections;
  try {
    const etsCount1 = await etsCollection.countDocuments({});
    const phacCount1 = await phacCollection.countDocuments({});
    console.log('Count 1', etsCount1, phacCount1);
    console.log('Is disabled:', process.env.DB_WRITE_SERVICE_DISABLED);
    const duplicates = await markDuplicates(etsCollection, phacCollection);
    console.log(duplicates);
    // const transactions = await sendPhacToSBC(phacCollection);
    // console.log(transactions);
    // await postToSlack('PHAC to Service BC (OCP)', start, duplicates, transactions);
    const etsCount2 = await etsCollection.countDocuments({});
    const phacCount2 = await phacCollection.countDocuments({});
    console.log('Count 2', etsCount2, phacCount2);
  } catch (error) {
    console.error(`Failed to mark duplicates or post to SBC ${error}`);
  } finally {
    connection.close();
    tunnel.close();
  }
})();
