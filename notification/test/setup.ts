import { INestApplication } from '@nestjs/common';

import * as dotenv from 'dotenv';
import * as path from 'path';

import { RabbitMQHelper } from '../../common/tests/helpers/rabbitmq.helper';
import { createApplication } from '../src/app';
import { QUEUE_NAME } from '../src/constants';

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Make sure the queue name is set for tests
if (!process.env.RABBITMQ_QUEUE) {
  process.env.RABBITMQ_QUEUE = 'notifications_queue';
}

// Log the environment configuration for debugging
console.log(`Test environment initialized with:
- RabbitMQ URI: ${process.env.RABBITMQ_URI}
- RabbitMQ Queue: ${process.env.RABBITMQ_QUEUE}`);

export const API_PREFIX = '/api/v1';

export let app: INestApplication;
export let rabbitMQHelper: RabbitMQHelper;

beforeAll(async () => {
  rabbitMQHelper = new RabbitMQHelper({ queue: QUEUE_NAME });
  await rabbitMQHelper.connect();
  await rabbitMQHelper.purgeQueue();

  app = await createApplication();
  await app.listen(process.env.NOTIFICATION_SERVICE_PORT || 4001);
});

afterAll(async () => {
  await app.close();

  if (rabbitMQHelper) {
    await rabbitMQHelper.purgeQueue();
    await rabbitMQHelper.close();
  }
});
