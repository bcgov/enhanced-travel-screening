const fs = require('fs');

const readAwsRdsCA = () => fs.readFileSync(`${__dirname}/certificates/rds-combined-ca-bundle.pem`);

module.exports = readAwsRdsCA;
