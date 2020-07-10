/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-absolute-path */
const { MongoClient } = require('/opt/nodejs/node_modules/mongodb');
const { sendEtsToSBC } = require('/opt/nodejs/node_modules/custom_modules/sbc-phac-ets');
const readAwsRdsCA = require('/opt/nodejs/node_modules/custom_modules/certificates/read-aws-rds');


/* eslint-disable no-console */

const dbConnectionOptions = (server) => ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: server !== 'mongodb',
  sslValidate: server !== 'mongodb',
  sslCA: server === 'mongodb' ? undefined : [readAwsRdsCA()],
});

const dbConnectionAndCollections = async (collections) => {
  const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_SERVER}:${process.env.DB_PORT}`;
  const connection = await MongoClient.connect(uri, dbConnectionOptions(process.env.DB_SERVER));
  const db = connection.db(process.env.DB_NAME);
  return { connection, collections: collections.map((c) => db.collection(c)) };
};

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
