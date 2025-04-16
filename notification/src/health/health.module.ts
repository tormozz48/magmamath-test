import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TerminusModule } from '@nestjs/terminus';

import { QUEUE_NAME } from '../../../common/constants';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule,
    ClientsModule.registerAsync([
      {
        name: 'HEALTH_RABBITMQ_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI')],
            queue: QUEUE_NAME,
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
