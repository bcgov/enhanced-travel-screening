import { MongoClient } from 'mongodb';

import fs from 'fs';

const dbConnectionOptions = server => ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: server !== 'mongodb',
  sslValidate: server !== 'mongodb',
  sslCA:
    server === 'mongodb'
      ? undefined
      : [fs.readFileSync(`${__dirname}/certificates/rds-combined-ca-bundle.pem`)],
});

const dbConnectionAndCollections = async collections => {
  const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_SERVER}:${process.env.DB_PORT}`;
  const connection = await MongoClient.connect(uri, dbConnectionOptions(process.env.DB_SERVER));
  const db = connection.db(process.env.DB_NAME);
  return { connection, collections: collections.map(c => db.collection(c)) };
};

export default dbConnectionAndCollections;
