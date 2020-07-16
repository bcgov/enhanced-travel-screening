const dayjs = require('dayjs');
const PromisePool = require('es6-promise-pool');
const { postServiceItem } = require('./service-bc-api');

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

const cleanJoinArray = (a) => a
  .filter((i) => ['string', 'number'].includes(typeof i))
  .map((i) => String(i).trim())
  .filter((i) => i !== '')
  .join(', ');

const phacToSbc = (phacItem) => {
  const oldKeys = [
    'first_name', 'last_name', 'date_of_birth', 'address_1', 'postal_code', 'home_phone', 'mobile_phone', 'other_phone', 'arrival_date',
    'destination_type', 'email_address', 'province_territory', 'port_of_entry', 'land_port_of_entry', 'other_port_of_entry',
  ];
  const telephone = cleanJoinArray([
    phacItem.home_phone, phacItem.mobile_phone, phacItem.other_phone]);
  const by = cleanJoinArray([
    phacItem.port_of_entry, phacItem.land_port_of_entry, phacItem.other_port_of_entry]);
  const sbcItem = {
    ...phacItem,
    firstName: phacItem.first_name,
    lastName: phacItem.last_name,
    dob: phacItem.date_of_birth,
    address: phacItem.address_1,
    postalCode: phacItem.postal_code,
    email: phacItem.email_address,
    province: phacItem.province_territory,
    telephone,
    arrival: {
      date: phacItem.arrival_date,
      by,
    },
    isolationPlan: {
      type: phacItem.destination_type,
    },
  };
  oldKeys.forEach((k) => delete sbcItem[k]);
  return sbcItem;
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

const sendPhacToSBC = async (phacCollection) => {
  let data = await getUnsuccessfulSbcTransactions(phacCollection);
  data = data.map(phacToSbc);
  const sbcTransactionIterator = makeSbcTransactionIterator(phacCollection, data);
  const pool = new PromisePool(sbcTransactionIterator, 10);
  await pool.start();
  return `Attempted to send ${data.length} items to SBC`;
};

module.exports = { sendPhacToSBC, sendEtsToSBC };
