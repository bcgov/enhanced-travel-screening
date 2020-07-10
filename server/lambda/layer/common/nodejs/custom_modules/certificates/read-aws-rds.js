const fs = require('fs');

const readAwsRdsCA = () => fs.readFileSync(`${__dirname}/rds-combined-ca-bundle.pem`);

module.exports = readAwsRdsCA;
