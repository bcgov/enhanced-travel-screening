import axios from 'axios';

const generateStreamLink = (): string => {
  const encode = s =>
    s
      .replace(/\$/g, '$2524')
      .replace(/\[/g, '$255B')
      .replace(/\]/g, '$255D')
      .replace(/\//g, '$252F');
  if (
    ['AWS_LAMBDA_LOG_GROUP_NAME', 'AWS_LAMBDA_LOG_STREAM_NAME', 'AWS_REGION']
      .map(x => process.env[x])
      .some(x => typeof x === 'undefined')
  )
    return null;
  const logGroup = encode(process.env.AWS_LAMBDA_LOG_GROUP_NAME);
  const logStream = encode(process.env.AWS_LAMBDA_LOG_STREAM_NAME);
  return `https://${process.env.AWS_REGION}.console.aws.amazon.com/cloudwatch/home?region=${process.env.AWS_REGION}#logsV2:log-groups/log-group/${logGroup}/log-events/${logStream}`;
};

const formatTime = (start: number): string => {
  if (!start) return 'N/A';
  const elapsed = (new Date().getTime() - start) / 1000;
  return `${Math.floor(elapsed / 60)}m${(elapsed % 60).toFixed(3)}s`;
};

const formatFunctionName = (): string => {
  const { AWS_LAMBDA_FUNCTION_NAME: name, AWS_LAMBDA_FUNCTION_VERSION: version } = process.env;
  return name && version ? `${name}:${version}` : 'N/A';
};

/**
 * https://api.slack.com/reference/block-kit/blocks#section
 */
const formatMessage = (title: string, time: string, message: string) => {
  const escapedMessage = typeof message === 'string' ? message : JSON.stringify(message);
  const payload: any = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Job Title: *${title}*\nLambda Function Name: ${formatFunctionName()}\nElapsed Time: ${time}\n\nFull output included below.`,
        },
      },
      { type: 'divider' },
      { type: 'section', text: { type: 'plain_text', text: escapedMessage } },
    ],
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

const postToSlack = async (title: string, start: number, ...messages: string[]) => {
  if (!/^https:\/\/hooks\.slack\.com/.test(process.env.SLACK_ENDPOINT))
    throw Error('No valid Slack endpoint specified');
  const payload = formatMessage(title, formatTime(start), messages.join('\n'));
  await axios.post(process.env.SLACK_ENDPOINT, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
};

export default postToSlack;
