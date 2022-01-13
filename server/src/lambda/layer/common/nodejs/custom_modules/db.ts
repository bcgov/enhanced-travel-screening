import { Collection, MongoClient, MongoClientOptions } from 'mongodb';

import fs from 'fs';

const dbConnectionOptions = (server: string) => ({
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: server !== 'mongodb',
  sslValidate: server !== 'mongodb',
  sslCA:
    server === 'mongodb'
      ? undefined
      : [fs.readFileSync(`${__dirname}/certificates/rds-combined-ca-bundle.pem`)],
});

export interface ConnectionResult {
  connection: MongoClient;
  collections: Collection[];
}

const dbConnectionAndCollections = async (collections: string[]): Promise<ConnectionResult> => {
  const { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_NAME } = process.env;
  const uri = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_SERVER}:${DB_PORT}`;
  const connection = await MongoClient.connect(uri, dbConnectionOptions(DB_SERVER));
  const db = connection.db(DB_NAME);
  return { connection, collections: collections.map(c => db.collection(c)) };
};

export default dbConnectionAndCollections;
