const tunnel = require('tunnel-ssh');
const { MongoClient } = require('mongodb');

const dbConnectionAndCollections = async (collections) => {
  await tunnel({
    username: process.env.AWS_SSH_USERNAME,
    privateKey: Buffer.from(process.env.AWS_SSH_KEY, 'base64'),
    host: process.env.AWS_SSH_HOST,
    dstHost: process.env.DB_SERVER,
    dstPort: process.env.DB_PORT,
    localPort: process.env.DB_PORT,
  });
  const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:${process.env.DB_PORT}`;
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true, // Using SSH tunnel through bastion host
    sslValidate: false, // Using SSH tunnel through bastion host
  };
  const connection = await MongoClient.connect(uri, options);
  const db = connection.db(process.env.DB_NAME);
  return { connection, collections: collections.map((c) => db.collection(c)) };
};

const countQueries = async (queries, collection) => {
  const promises = queries.map((x) => collection.countDocuments(x));
  return Promise.all(promises);
};

(async () => {
  const { connection, collections } = await dbConnectionAndCollections(['ets-phac']);
  const [phacCollection] = collections;
  const queries = [
    {},
  ];
  const labels = ['All-Time Travellers'];
  try {
    const results = await countQueries(queries, phacCollection);
    const message = labels.reduce((a, x, i) => `${a}\n${x}: ${results[i]}`, '======= Connected to AWS DocumentDB =======');
    console.log(message);
  } catch (error) {
    console.error(error);
  } finally {
    connection.close();
  }
})();
