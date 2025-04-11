import { INestApplication } from '@nestjs/common';

import * as dotenv from 'dotenv';
import * as path from 'path';

import { MongoDBHelper } from '../../common/tests/helpers/mongodb.helper';
import { RabbitMQHelper } from '../../common/tests/helpers/rabbitmq.helper';
import { createApplication } from '../src/app';
import { QUEUE_NAME } from '../src/constants';

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.join(process.cwd(), '.env') });

// For e2e tests, override the MongoDB URI to use a test database
process.env.MONGODB_URI = process.env.MONGODB_URI?.replace(
  process.env.MONGODB_DATABASE || 'users_db',
  'user-service-test',
);

// Make sure the queue name is set for tests
if (!process.env.RABBITMQ_QUEUE) {
  process.env.RABBITMQ_QUEUE = 'notifications_queue';
}

jest.setTimeout(10000);

// Log the environment configuration for debugging
console.log(`Test environment initialized with:
- MongoDB URI: ${process.env.MONGODB_URI}
- RabbitMQ URI: ${process.env.RABBITMQ_URI}
- RabbitMQ Queue: ${process.env.RABBITMQ_QUEUE}`);

export const API_PREFIX = '/api/v1';

export let app: INestApplication;
export let mongoDBHelper: MongoDBHelper;
export let rabbitMQHelper: RabbitMQHelper;

beforeAll(async () => {
  mongoDBHelper = new MongoDBHelper();
  await mongoDBHelper.connect();
  await mongoDBHelper.purgeDatabase();

  rabbitMQHelper = new RabbitMQHelper({ queue: QUEUE_NAME });
  await rabbitMQHelper.connect();
  await rabbitMQHelper.purgeQueue();

  app = await createApplication();
  await app.listen(process.env.USER_SERVICE_PORT || 4000);
});

afterAll(async () => {
  await app.close();

  if (rabbitMQHelper) {
    await rabbitMQHelper.purgeQueue();
    await rabbitMQHelper.close();
  }

  if (mongoDBHelper) {
    await mongoDBHelper.purgeDatabase();
    await mongoDBHelper.close();
  }
});
