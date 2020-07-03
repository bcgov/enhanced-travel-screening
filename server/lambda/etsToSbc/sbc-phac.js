const dayjs = require('dayjs');
const PromisePool = require('es6-promise-pool');
const { postServiceItem } = require('./service-bc');

const getUnsuccessfulSbcTransactions = async (collection) => {
  const dateRange = [dayjs().subtract(13, 'day'), dayjs().subtract(2, 'day')]
    .map((d) => d.startOf('day').toDate());
  const query = [
    { $addFields: { parsed_arrival_date: { $dateFromString: { dateString: '$arrival_date', timezone: '-0700' } } } },
    {
      $match: {
        $and: [
          { 'serviceBCTransactions.status': { $ne: 'success' } },
          { parsed_arrival_date: { $gte: dateRange[0], $lte: dateRange[1] } },
        ],
      },
    },
    {
      $project: { // Scrub unneeded fields
        _id: 0, serviceBCTransactions: 0, parsed_arrival_date: 0, derivedTravellerKey: 0,
      },
    },
  ];
  const items = await collection.aggregate(query).toArray();
  return items;
};

const updateSbcTransactions = async (collection, id, transaction) => collection.updateOne(
  { id },
  { $push: { serviceBCTransactions: transaction }, $set: { updatedAt: new Date().toISOString() } },
);

const postToSbcAndUpdateDb = async (collection, submission) => {
  const transaction = await postServiceItem(submission);
  await updateSbcTransactions(collection, submission.id, transaction);
  return { id: submission.id, status: transaction.status };
};

function* makeSbcTransactionIterator(collection, data) {
  for (const d of data) { // eslint-disable-line no-restricted-syntax
    yield postToSbcAndUpdateDb(collection, d);
  }
}

const sendEtsToSBC = async (etsCollection) => {
  const data = await getUnsuccessfulSbcTransactions(etsCollection);
  const sbcTransactionIterator = makeSbcTransactionIterator(etsCollection, data);
  const pool = new PromisePool(sbcTransactionIterator, 10);
  await pool.start();
  return `Attempted to send ${data.length} items to SBC`;
};

module.exports = sendEtsToSBC;
