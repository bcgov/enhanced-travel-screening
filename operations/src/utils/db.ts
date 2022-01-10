import { MongoClient } from 'mongodb';
import loadEnv from './load-env';

loadEnv(['DB_SERVER', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']);

export const dbConnectionAndCollections = async (collections: string[]) => {
  const { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT } = process.env;
  const uri = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_SERVER}:${DB_PORT}`;
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: false,
  };
  const connection = await MongoClient.connect(uri, options);
  const db = connection.db(process.env.DB_NAME);
  return { connection, collections: collections.map((c) => db.collection(c)) };
};
