const axios = require('axios');

const generateStreamLink = () => {
  if (process.env.CLUSTER === '' || process.env.NAMESPACE === '' || process.env.POD_NAME === '') return null;
  return `${process.env.CLUSTER}/console/project/${process.env.NAMESPACE}/browse/pods/${process.env.POD_NAME}?tab=logs`;
};

const formatTime = (start) => {
  if (!start) return 'N/A';
  const elapsed = (new Date().getTime() - start) / 1000;
  return `${Math.floor(elapsed / 60)}m${(elapsed % 60).toFixed(3)}s`;
};

const formatMessage = (title, time, message) => {
  const escapedMessge = typeof message === 'string' ? message : JSON.stringify(message);
  const payload = {
    blocks: [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Job Title: *${title}*\nElapsed Time: ${time}\n\nFull output included below.`,
      },
    },
    { type: 'divider' },
    { type: 'section', text: { type: 'plain_text', text: escapedMessge } }],
  };
  const link = generateStreamLink();
  if (link != null) {
    payload.blocks[0].accessory = {
      type: 'button',
      text: { type: 'plain_text', text: 'View CW Logs' },
      action_id: 'view_logs',
      url: link,
    };
  }
  return payload;
};

const postToSlack = async (title, start, ...messages) => {
  if (!/^https:\/\/hooks\.slack\.com/.test(process.env.SLACK_ENDPOINT)) throw Error('No valid Slack endpoint specified');
  const payload = formatMessage(title, formatTime(start), messages.join('\n'));
  await axios.post(process.env.SLACK_ENDPOINT, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
};

module.exports = postToSlack;
