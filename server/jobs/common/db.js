/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
const tunnel = require('tunnel-ssh');
const { MongoClient } = require('mongodb');

const tunnelOptions = {
  username: process.env.SSH_USERNAME,
  privateKey: Buffer.from(process.env.SSH_KEY, 'base64'),
  host: process.env.SSH_HOST,
  dstHost: process.env.DB_SERVER,
  dstPort: process.env.DB_PORT,
  localPort: process.env.DB_PORT,
};

const dbConnectionAndCollections = async (collections) => {
  await tunnel(tunnelOptions);
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

module.exports = dbConnectionAndCollections;
