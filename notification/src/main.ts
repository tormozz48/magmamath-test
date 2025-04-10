import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import * as dotenv from 'dotenv';
import * as path from 'path';

import { AppModule } from './app.module';
import { RABBITMQ_QUEUE } from './constants/rabbitmq.constants';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function bootstrap() {
  const logger = new Logger('NotificationService');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('NOTIFICATION_SERVICE_PORT', 4001);
  const rabbitmqUri = configService.get<string>('RABBITMQ_URI');

  // Connect to RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUri],
      queue: RABBITMQ_QUEUE,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(`Notification service is running on port ${port}`);
  logger.log(`Connected to RabbitMQ at ${rabbitmqUri}`);
}

bootstrap();
