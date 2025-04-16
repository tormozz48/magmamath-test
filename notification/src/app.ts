import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { QUEUE_NAME } from '../../common/constants';
import { AppModule } from './app.module';

export async function createApplication(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const rabbitmqUri = configService.get<string>('RABBITMQ_URI');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUri],
      queue: QUEUE_NAME,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  return app;
}
