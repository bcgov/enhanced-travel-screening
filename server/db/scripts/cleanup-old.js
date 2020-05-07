/* eslint-disable */
const { dbClient, collections } = require('..');
const csv = require('fast-csv');

/* eslint-disable no-console */
(async () => {
  if (require.main === module) {
    try {
      console.log('Connecting with database server');
      await dbClient.connect();

      const ids = [];
      console.log('Reading "old-records.csv" file');
      csv.parseFile(__dirname + '/old-records.csv', { headers: true })
        .on("data", data => {
          ids.push(data.id);
        })
        .on("end", async () => {
          console.log('Setting blank "createdAt"');
          const formsCollection = dbClient.db.collection(collections.FORMS);

          await formsCollection.updateMany(
            { id: { $in: ids } }, // Query
            { // UpdateQuery
              $unset: {
                createdAt: '',
              },
            },
          );
          console.log('Done.');
          process.exit();
        });
    } catch (error) {
      console.error(`Failed to clean up old data records, ${error}`);
    }
  }
})();
/* eslint-enable no-console */
