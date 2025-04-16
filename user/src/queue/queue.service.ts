import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { UserEventType, userEventPattern } from '../../../common/constants';
import { UserEventDto } from '../../../common/dto/user-event.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(@Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy) {}

  async onApplicationBootstrap() {
    try {
      await this.client.connect();
      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  async publishUserEvent(user: UserDocument, eventType: UserEventType) {
    this.publishEvent(userEventPattern[eventType], UserEventDto.fromEntity(user), eventType);
  }

  private async publishEvent<T extends Record<string, any>, U>(
    pattern: string,
    data: T,
    eventType: U,
  ) {
    const idInfo = data.id ? ` for ${eventType}: ${data.id}` : '';
    try {
      this.client.emit(pattern, data);
      this.logger.log(`Published ${eventType} event${idInfo}`);
    } catch (error) {
      this.logger.error(`Failed to publish ${eventType} event${idInfo}`, error);
    }
  }
}
