const https = require('https');
const util = require('util');

exports.handler = function (event, context) {
  const path = new URL(process.env.SLACK_ENDPOINT).pathname;
  console.log(JSON.stringify(event, null, 2));
  console.log('From SNS:', event.Records[0].Sns.Message);

  const postData = {
    text: `* ${process.env.NODE_ENV.toUpperCase()} ==> ${event.Records[0].Sns.Subject}*`,
  };

  const message = event.Records[0].Sns.Message;
  const severity = 'danger';

  postData.attachments = [
    {
      color: severity,
      text: '```' + message + '```',
    },
  ];

  const options = {
    method: 'POST',
    hostname: 'hooks.slack.com',
    port: 443,
    path,
  };

  const req = https.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      context.done(null);
    });
  });

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  req.write(util.format('%j', postData));
  req.end();
};
