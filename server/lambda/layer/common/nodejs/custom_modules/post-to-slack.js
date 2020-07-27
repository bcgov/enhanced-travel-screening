const axios = require('axios');

const generateStreamLink = () => {
  const encode = (s) => s
    .replace(/\$/g, '$2524')
    .replace(/\[/g, '$255B')
    .replace(/\]/g, '$255D')
    .replace(/\//g, '$252F');
  const logGroup = encode(process.env.AWS_LAMBDA_LOG_GROUP_NAME);
  const logStream = encode(process.env.AWS_LAMBDA_LOG_STREAM_NAME);
  return `https://${process.env.AWS_REGION}.console.aws.amazon.com/cloudwatch/home?region=${process.env.AWS_REGION}#logsV2:log-groups/log-group/${logGroup}/log-events/${logStream}`;
};

const formatTime = (start) => {
  const elapsed = (new Date().getTime() - start) / 1000;
  return `${Math.floor(elapsed / 60)}m${Math.round(elapsed % 60)}s`;
};

const formatMessage = (title, time, message) => `
{ "blocks": [
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Lambda Job: *${title}*\nFunction Name: ${process.env.AWS_LAMBDA_FUNCTION_NAME}:${process.env.AWS_LAMBDA_FUNCTION_VERSION}\nElapsed Time: ${time}\n\nFull output included below."
    },
    "accessory": {
      "type": "button",
      "text": { "type": "plain_text", "text": "View CW Logs" },
      "action_id": "view_logs",
      "url": "${generateStreamLink()}"
    }
  },
  { "type": "divider" },
  { "type": "section", "text": { "type": "plain_text", "text": "${message}" } }
] }`;

const postToSlack = async (title, start, ...messages) => {
  if (!/^https:\/\/hooks\.slack\.com/.test(process.env.SLACK_ENDPOINT)) throw Error('No valid Slack endpoint specified');
  await axios.post(process.env.SLACK_ENDPOINT, formatMessage(title, formatTime(start), messages.join('\n')), {
    headers: { 'Content-Type': 'application/json' },
  });
};

module.exports = postToSlack;
