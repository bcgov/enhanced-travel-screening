const dayjs = require('dayjs');

const getUnsuccessfulSbcTransactions = async (collection, currentDate) => {
  const dateRange = [dayjs(currentDate).subtract(14, 'day'), dayjs(currentDate).subtract(2, 'day')]
    .map((d) => d.startOf('day').toDate());
  const query = [
    { $addFields: { parsed_arrival_date: { $dateFromString: { dateString: '$arrival_date', timezone: '-0700' } } } },
    {
      $match: {
        $and: [
          { 'serviceBCTransactions.status': { $nin: ['success'] } },
          { parsed_arrival_date: { $gte: dateRange[0], $lte: dateRange[1] } },
        ],
      },
    },
    { $project: { _id: 0, serviceBCTransactions: 0, parsed_arrival_date: 0 } },
  ];
  const items = await collection.aggregate(query).toArray();
  return items;
};

module.exports = { getUnsuccessfulSbcTransactions };
