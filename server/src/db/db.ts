import fs from 'fs';
import { Db, MongoClient, MongoClientOptions, ReadPreference } from 'mongodb';
import logger from '../logger';

/**
 * This utility module provides helper methods to allow the application
 * to easily interact with a DocumentDB/MongoDB database
 */
class DBClient {
  private _connection: MongoClient;
  public db: Db;

  /**
   * Return config variables
   *
   * @returns
   * @memberof DBClient
   */
  config() {
    return {
      dbServer: process.env.DB_SERVER || 'localhost',
      dbPort: process.env.DB_PORT || '27017',
      dbUser: process.env.DB_USER || 'development',
      dbPassword: process.env.DB_PASSWORD || 'development',
      dbName: process.env.DB_NAME || 'development',
      dbTLSEnabled: process.env.DB_AWS_TLS_ENABLED === 'true',
      dbTLSDisableCert: process.env.DB_AWS_TLS_DISABLE_CERTIFICATE === 'true',
      useReplicaSet: process.env.DB_USE_REPLICA_SET === 'true',
    };
  }

  /**
   * Console log current configuration but password
   */
  printConfig() {
    const { dbPassword, ...config } = this.config();
    console.log(config); // eslint-disable-line no-console
  }

  /**
   * Connect to database
   *
   * @returns {Promise<void>}
   * @memberof DB
   */
  async connect(): Promise<MongoClient> {
    if (this._connection) return this._connection;

    const {
      dbServer,
      dbPort,
      dbUser,
      dbPassword,
      dbName,
      dbTLSEnabled,
      useReplicaSet,
      dbTLSDisableCert,
    } = this.config();

    // https://docs.aws.amazon.com/documentdb/latest/developerguide/connect-from-outside-a-vpc.html

    const uri =
      process.env.USE_GHA_MONGO === 'true'
        ? 'mongodb://localhost/test'
        : `mongodb://${dbUser}:${dbPassword}@${dbServer}:${dbPort}/${dbName}`;

    const options: MongoClientOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    if (dbTLSEnabled) {
      options.ssl = true;
      options.sslValidate = !dbTLSDisableCert;
      // Specify the Amazon DocumentDB cert
      options.sslCA = dbTLSDisableCert
        ? undefined
        : [fs.readFileSync(`${__dirname}/certificates/rds-combined-ca-bundle.pem`)];
    }

    // Create a MongoDB client opening a connection to Amazon DocumentDB as a replica set,
    // and specify the read preference as secondary preferred following AWS best practices
    // https://docs.aws.amazon.com/documentdb/latest/developerguide/connect-to-replica-set.html
    if (useReplicaSet) {
      options.readPreference = ReadPreference.SECONDARY_PREFERRED;
      options.replicaSet = 'rs0';
    }

    try {
      this._connection = await MongoClient.connect(uri, options);
      this.db = this._connection.db(dbName);
      return this._connection;
    } catch (err) {
      logger.error(`Failed to connect to database: ${err}`);
      throw new Error('DBError');
    }
  }

  /**
   * Change database being used
   *
   * @param {*} database
   * @memberof DBClient
   */
  useDB(database: string) {
    this.db = this._connection.db(database);
  }

  /**
   * Disconnect from database
   *
   * @returns
   * @memberof DB
   */
  async disconnect() {
    if (!this._connection) return;

    try {
      await this._connection.close();
    } catch (err) {
      logger.error(`Failed to disconnect from database: ${err}`);
    }
  }
}

export const dbClient = new DBClient();
