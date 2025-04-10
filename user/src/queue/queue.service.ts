import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import {
  RABBITMQ_USER_CREATED_PATTERN,
  RABBITMQ_USER_DELETED_PATTERN,
  RABBITMQ_USER_UPDATED_PATTERN,
  UserEventType,
} from '../constants/rabbitmq.constants';
import { UserResponseDto } from '../users/dto/user-response.dto';

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

  async publishUserCreated(user: UserResponseDto) {
    return this.publishEvent(RABBITMQ_USER_CREATED_PATTERN, user, UserEventType.CREATED);
  }

  async publishUserUpdated(user: UserResponseDto) {
    return this.publishEvent(RABBITMQ_USER_UPDATED_PATTERN, user, UserEventType.UPDATED);
  }

  async publishUserDeleted(user: UserResponseDto) {
    return this.publishEvent(RABBITMQ_USER_DELETED_PATTERN, user, UserEventType.DELETED);
  }

  /**
   * Generic method to publish events to RabbitMQ
   * @param pattern The message pattern
   * @param data The data to publish
   * @param eventType The type of event
   */
  private async publishEvent<T extends Record<string, any>>(
    pattern: string,
    data: T,
    eventType: UserEventType,
  ) {
    try {
      this.client.emit(pattern, data);

      const idInfo = data.id ? ` for ${eventType}: ${data.id}` : '';
      this.logger.log(`Published ${eventType} event${idInfo}`);
    } catch (error) {
      const idInfo = data.id ? ` for ${eventType}: ${data.id}` : '';
      this.logger.error(`Failed to publish ${eventType} event${idInfo}`, error);
    }
  }
}
