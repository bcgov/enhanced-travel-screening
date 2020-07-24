const axios = require('axios');

const postToSlack = async (message) => {
  if (!/^https:\/\/hooks\.slack\.com/.test(process.env.SLACK_ENDPOINT)) throw Error('No valid Slack endpoint specified');
  await axios.post(process.env.SLACK_ENDPOINT, { text: message }, {
    headers: { 'Content-Type': 'application/json' },
  });
};

module.exports = postToSlack;
