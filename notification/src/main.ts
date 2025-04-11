import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as dotenv from 'dotenv';
import * as path from 'path';

import { createApplication } from './app';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function bootstrap() {
  const logger = new Logger('NotificationService');
  const app = await createApplication();
  const configService = app.get(ConfigService);

  const rabbitmqUri = configService.get<string>('RABBITMQ_URI');
  const port = configService.get<number>('NOTIFICATION_SERVICE_PORT', 4001);
  await app.listen(port, () => {
    logger.log(`Notification service is running on port ${port}`);
    logger.log(`Connected to RabbitMQ at ${rabbitmqUri}`);
  });
}

bootstrap();
