import inquirer from 'inquirer';
import dayjs from 'dayjs';

import { Collection, Filter } from 'mongodb';
import { dbConnectionAndCollections } from '../utils/db';

const countQueries = async (queries: Filter<any>[], collection: Collection) => {
  const promises = queries.map((x) => collection.countDocuments(x));
  return Promise.all(promises);
};

const getLastWeek = () => {
  const end = dayjs().startOf('week'); // last Sunday
  const start = end.subtract(7, 'day'); // second last Sunday
  return [start, end].map((x) => x.format('YYYY-MM-DD'));
};

const getUserInput = async () => {
  const range = getLastWeek();
  let [startString, endString] = range;

  if (process.argv.slice(2).includes('-d')) {
    // This script allows passing the -d which uses the default date range
    // (last week, Sunday to Sunday)
    // This is to allow the script to be called by a cron job (or similar)
    // and skip the interactive input step
    console.log(`Using default date range of ${range[0]} to ${range[1]}`);
  } else {
    const startDateQuestion = [{ name: 'Start Date', type: 'input', default: range[0] }];
    ({ 'Start Date': startString } = await inquirer.prompt(startDateQuestion));
    const endDateQuestion = [{ name: 'End Date', type: 'input', default: range[1] }];
    ({ 'End Date': endString } = await inquirer.prompt(endDateQuestion));
  }

  // The following dates are initialized in PST (same as when records are created)
  // The date range should therefore always target 07:00 UTC
  // 24h are added to the end date as we would like to include the full day
  const start = dayjs(startString).toISOString(); // Start of the period in UTC
  const end = dayjs(endString).add(24, 'hour').toISOString(); // End of the period in UTC
  return { start, end };
};

(async () => {
  const { start, end } = await getUserInput();
  const { connection, collections } = await dbConnectionAndCollections(['ets-phac']);
  const [phacCollection] = collections;

  const dateRangeMatch = { createdAt: { $gte: start, $lt: end } };
  const airMatch = { port_of_entry: /Airport/ };
  const landMatch = {
    $or: [
      { port_of_entry: 'Land border' },
      { port_of_entry: 'Rail border' },
    ],
  };
  const marineMatch = { port_of_entry: 'Marine border' };
  const queries = [
    {},
    dateRangeMatch,
    { $and: [airMatch, dateRangeMatch] },
    { $and: [landMatch, dateRangeMatch] },
    { $and: [marineMatch, dateRangeMatch] },
    { $and: [{ $nor: [airMatch, landMatch, marineMatch] }, dateRangeMatch] },
  ];
  const labels = ['All-Time Travellers', 'Travellers in Date Range', 'Air', 'Land', 'Marine', 'Unknown'];
  try {
    const results = await countQueries(queries, phacCollection);
    console.log(`Results from ${start} to ${end}`);
    results.forEach((result, index) => {
      console.log(`${labels[index]}: ${result}`);
    });
  } catch (error) {
    console.error(error);
  } finally {
    await connection.close();
    process.exit();
  }
})();
