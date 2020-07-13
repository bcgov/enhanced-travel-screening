const AWS = require('aws-sdk');
const logger = require('../logger');

AWS.config.update({ region: process.env.AWS_REGION });
const opts = {
  credentials: new AWS.EC2MetadataCredentials(),
};

const elasticbeanstalk = new AWS.ElasticBeanstalk(opts);
const ec2 = new AWS.EC2(opts);
const metadata = new AWS.MetadataService(opts);

const isCurrentInstanceMaster = async () => {
  try {
    const request = new Promise((resolve, reject) => {
      metadata.request('/latest/meta-data/instance-id', (err, InstanceId) => {
        if (err) { return reject(err); }
        return resolve(InstanceId);
      });
    });
    const currentInstanceId = await request;
    const params = {
      Filters: [
        {
          Name: 'resource-id',
          Values: [currentInstanceId],
        },
      ],
    };
    // premission: ec2:DescribeTags
    const tagData = await ec2.describeTags(params).promise();
    const envIdTag = tagData.Tags.find((t) => t.Key === 'elasticbeanstalk:environment-id');
    if (envIdTag === null) {
      throw Error('Failed to find the value of "elasticbeanstalk:environment-id" tag.');
    }
    // permissions: elasticbeanstalk:DescribeEnvironmentResources,
    // autoscaling:DescribeAutoScalingGroups
    const envData = await elasticbeanstalk.describeEnvironmentResources(
      { EnvironmentId: envIdTag.Value },
    ).promise();
    return currentInstanceId === envData.EnvironmentResources.Instances[0].Id;
  } catch (e) {
    logger.error(e);
  }
  return false;
};

const runTaskOnMaster = async (taskToRun) => {
  if (process.env.NODE_ENV !== 'production') {
    return taskToRun();
  }
  const isMaster = await isCurrentInstanceMaster();
  if (isMaster) {
    logger.info('Cron-job running as master EB instance. Executing...');
    return taskToRun();
  }
  logger.info('Cron-job not running as master EB instance. Aborting.');
  return false;
};

module.exports = { runTaskOnMaster };