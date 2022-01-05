const dayjs = require('dayjs');
const asyncPool = require('tiny-async-pool');
const { postServiceItem } = require('./service-bc-api');
const postToSlack = require('./post-to-slack');

const logger = require('./logger');

const getUnsuccessfulSbcTransactions = async (collection, arrivalKey) => {
  const dateRange = [
    dayjs().subtract(13, 'day'),
    dayjs().subtract(3, 'day'),
  ].map((d) => d.startOf('day').toDate());
  const query = [
    {
      $addFields: {
        parsed_arrival_date: {
          $dateFromString: { dateString: arrivalKey, timezone: '-0700' },
        },
      },
    },
    {
      $match: {
        $and: [
          {
            'serviceBCTransactions.status': { $ne: 'success' },
          },
          {
            $and: [
              {
                $or: [
                  {
                    $and: [
                      {
                        prioritized_traveler: 'Yes',
                      },
                      {
                        parsed_arrival_date: {
                          $gte: dateRange[0],
                          $lt: dayjs().startOf('day').toDate(),
                        },
                      },
                    ],
                  },
                  {
                    parsed_arrival_date: {
                      $gte: dateRange[0],
                      $lt: dateRange[1],
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      $project: {
        // Scrub unneeded fields
        _id: 0,
        serviceBCTransactions: 0,
        parsed_arrival_date: 0,
        derivedTravellerKey: 0,
      },
    },
  ];
  const items = await collection.aggregate(query).toArray();
  return items;
};

// Following NoSQL recommendation, in this case, we want to store
// BC Services transactional data on the record itself
const updateSbcTransactions = async (collection, id, transaction) => collection.updateOne(
  { id },
  {
    $push: { serviceBCTransactions: transaction },
    $set: { updatedAt: new Date().toISOString() },
  },
);

const postToSbcAndUpdateDb = async (collection, submission) => {
  logger.info('Post to SBC Starts');
  // TODO: transaction metrics on each call, time taken etc?
  let transaction;
  try {
    transaction = await postServiceItem(submission);
  } catch (e) {
    const processedAt = new Date().toISOString();
    transaction = {
      status: 'fail',
      errorDetails: JSON.stringify(e),
      processedAt,
    };
    logger.error('POST TO SBC: failed for');
    logger.error(transaction);
    const message = `${new Date().toISOString()}: ${e.message}`;
    postToSlack('POST TO SBC ERROR: ', Date.now(), message).catch(logger.error);
  }
  await updateSbcTransactions(collection, submission.id, transaction);
  return { id: submission.id, status: transaction.status, transaction };
};

const cleanJoinArray = (a) => a
  .filter((i) => ['string', 'number'].includes(typeof i))
  .map((i) => String(i).trim())
  .filter((i) => i !== '')
  .join(', ');

const phacToSbc = (phacItem) => {
  const oldKeys = [
    'first_name',
    'last_name',
    'date_of_birth',
    'address_1',
    'postal_code',
    'home_phone',
    'mobile_phone',
    'other_phone',
    'arrival_date',
    'destination_type',
    'email_address',
    'province_territory',
    'port_of_entry',
    'land_port_of_entry',
    'other_port_of_entry',
  ];
  const telephone = cleanJoinArray([
    phacItem.home_phone,
    phacItem.mobile_phone,
    phacItem.other_phone,
  ]);
  const by = cleanJoinArray([
    phacItem.port_of_entry,
    phacItem.land_port_of_entry,
    phacItem.other_port_of_entry,
  ]);
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

const makeTransactionIterator = (collection) => (d) => postToSbcAndUpdateDb(collection, d);

const executeTransactionPool = async (data, collection) => {
  const concurrency = 10; // How many requests running in parallel
  const iterator = makeTransactionIterator(collection);
  const results = await asyncPool(concurrency, data, iterator);
  const output = [
    `Sent ${results.length} items to SBC`,
    `${results.filter((i) => i.status === 'success').length} success(es)`,
    `${results.filter((i) => i.status === 'fail').length} failure(s)`,
  ];
  return output.join('\n');
};

const sendEtsToSBC = async (etsCollection) => {
  const data = await getUnsuccessfulSbcTransactions(
    etsCollection,
    '$arrival.date',
  );
  if (process.env.DB_WRITE_SERVICE_DISABLED === 'true') {
    return `DB_WRITE_SERVICE_DISABLED is true. Skipping retry of ${data.length} unsuccessful transaction(s) to SBC.`;
  }
  const result = await executeTransactionPool(data, etsCollection);
  return result;
};

const sendPhacToSBC = async (phacCollection) => {
  let data = await getUnsuccessfulSbcTransactions(
    phacCollection,
    '$arrival_date',
  );
  logger.info(`sendPhacToSBC - getUnsuccessfulSbcTransactions - ${data.length}`);
  if (process.env.DB_WRITE_SERVICE_DISABLED === 'true') {
    const message = `DB_WRITE_SERVICE_DISABLED is true. Skipping the sending of ${data.length} PHAC transaction(s) to SBC.`;
    logger.warn(message);
    return message;
  }
  logger.info('Preparing transaction pool');

  data = data.map(phacToSbc);

  const result = await executeTransactionPool(data, phacCollection);
  return result;
};

module.exports = { sendPhacToSBC, sendEtsToSBC };
