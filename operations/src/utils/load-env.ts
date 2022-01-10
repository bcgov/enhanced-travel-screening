import { config } from 'dotenv';

config();

const envVars = [
  'DB_SERVER',
  'DB_PORT',
  'DB_USER',
  'DB_NAME',
  'DB_PASSWORD',
];

const loadEnv = (required = envVars) => {
  if (required.some((v) => !process.env[v])) {
    console.error('Must provide the following required variables in .test.env file');
    console.error(required.join(', '));
    process.exit(1);
  }
};

export default loadEnv;