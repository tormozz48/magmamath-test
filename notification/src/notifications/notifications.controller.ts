import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import {
  RABBITMQ_USER_CREATED_PATTERN,
  RABBITMQ_USER_DELETED_PATTERN,
  RABBITMQ_USER_UPDATED_PATTERN,
} from '../constants/rabbitmq.constants';
import { UserNotificationDto } from './dto/user-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(RABBITMQ_USER_CREATED_PATTERN)
  handleUserCreated(data: UserNotificationDto) {
    this.notificationsService.handleUserCreated(data);
  }

  @EventPattern(RABBITMQ_USER_UPDATED_PATTERN)
  handleUserUpdated(data: UserNotificationDto) {
    this.notificationsService.handleUserUpdated(data);
  }

  @EventPattern(RABBITMQ_USER_DELETED_PATTERN)
  handleUserDeleted(data: UserNotificationDto) {
    this.notificationsService.handleUserDeleted(data);
  }
}
