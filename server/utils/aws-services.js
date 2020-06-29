const AWS = require('aws-sdk');
const logger = require('../logger');

AWS.config.update({ region: process.env.AWS_REGION });
const opts = {
  credentials: new AWS.EC2MetadataCredentials(),
};

const elasticbeanstalk = new AWS.ElasticBeanstalk(opts);
const ec2 = new AWS.EC2(opts);
const metadata = new AWS.MetadataService(opts);

const runTaskOnMaster = async (taskToRun) => {
  if (process.env.NODE_ENV !== 'production') {
    return taskToRun();
  }
  return new Promise((resolve, reject) => {
    metadata.request('/latest/meta-data/instance-id', (err, instanceId) => {
      if (err) { return reject(err); }
      return resolve(instanceId);
    });
  })
    .then((currentInstanceId) => {
      logger.info(`InstanceId: ${currentInstanceId}`);
      return new Promise((resolve, reject) => {
        const params = {
          Filters: [
            {
              Name: 'resource-id',
              Values: [currentInstanceId],
            },
          ],
        };

        ec2.describeTags(params, (err, data) => {
          if (err) { return reject(new Error(`describeTags: ${err}`)); }

          const envIdTag = data.Tags.find((t) => t.Key === 'elasticbeanstalk:environment-id');
          if (envIdTag === null) {
            return reject(new Error('Failed to find the value of "elasticbeanstalk:environment-id" tag.'));
          }
          return resolve(envIdTag.Value, currentInstanceId);
        });
      });
    })
    .then((envId, currentInstanceId) => new Promise((resolve, reject) => {
      elasticbeanstalk.describeEnvironmentResources({ EnvironmentId: envId }, (err, data) => {
        if (err) { return reject(new Error(`describeEnvironmentResources: ${err}`)); }
        logger.info(data.EnvironmentResources.Instances[0]);
        if (currentInstanceId !== data.EnvironmentResources.Instances[0].Id) {
          return resolve(false);
        }
        return resolve(true);
      });
    }))
    .then((isMaster) => {
      if (!isMaster) {
        logger.info('Not running cron job as master EB instance. Aborting.');
      } else {
        logger.info('Identified as master EB instance. Running cron job.');
        taskToRun();
      }
    })
    .catch((err) => logger.error(err));
};

module.exports = { runTaskOnMaster };
