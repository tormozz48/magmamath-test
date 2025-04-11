import * as dotenv from 'dotenv';
import * as path from 'path';

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

// Log the environment configuration for debugging
console.log(`Test environment initialized with:
- MongoDB URI: ${process.env.MONGODB_URI}
- RabbitMQ URI: ${process.env.RABBITMQ_URI}
- RabbitMQ Queue: ${process.env.RABBITMQ_QUEUE}`);
