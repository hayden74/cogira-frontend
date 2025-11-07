import { config } from 'dotenv';
import { join } from 'path';

// Load test config for local development only
if (process.env.NODE_ENV === 'test') {
  const envPath = join(__dirname, '../../env/test.env');
  config({ path: envPath });
}

export const appConfig = {
  env: process.env.NODE_ENV || 'dev',
  logLevel: process.env.LOG_LEVEL || 'info',
};
