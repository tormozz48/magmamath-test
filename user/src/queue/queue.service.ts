import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import {
  RABBITMQ_USER_CREATED_PATTERN,
  RABBITMQ_USER_DELETED_PATTERN,
  RABBITMQ_USER_UPDATED_PATTERN,
  UserEventType,
} from '../constants/rabbitmq.constants';
import { UserDocument } from '../users/schemas/user.schema';
import { UserEventDto } from './dto/user-event.dto';

/**
 * Service responsible for publishing events to RabbitMQ
 */
@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  /**
   * Creates a new instance of QueueService
   * @param client RabbitMQ client
   */
  constructor(@Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy) {}

  /**
   * Connects to RabbitMQ on application bootstrap
   */
  async onApplicationBootstrap() {
    try {
      await this.client.connect();
      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  /**
   * Publish a user created event
   * @param user User entity to publish
   */
  async publishUserCreated(user: UserDocument) {
    const userDto = UserEventDto.fromEntity(user);
    return this.publishEvent(RABBITMQ_USER_CREATED_PATTERN, userDto, UserEventType.CREATED);
  }

  /**
   * Publish a user updated event
   * @param user User entity to publish
   */
  async publishUserUpdated(user: UserDocument) {
    const userDto = UserEventDto.fromEntity(user);
    return this.publishEvent(RABBITMQ_USER_UPDATED_PATTERN, userDto, UserEventType.UPDATED);
  }

  /**
   * Publish a user deleted event
   * @param user User entity to publish
   */
  async publishUserDeleted(user: UserDocument) {
    const userDto = UserEventDto.fromEntity(user);
    return this.publishEvent(RABBITMQ_USER_DELETED_PATTERN, userDto, UserEventType.DELETED);
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
