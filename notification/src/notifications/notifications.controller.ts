import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import {
  RABBITMQ_USER_CREATED_PATTERN,
  RABBITMQ_USER_DELETED_PATTERN,
  RABBITMQ_USER_UPDATED_PATTERN,
} from '../constants/rabbitmq.constants';
import { UserEventDto } from './dto/user-event.dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(RABBITMQ_USER_CREATED_PATTERN)
  handleUserCreated(data: UserEventDto) {
    this.notificationsService.handleUserCreated(data);
  }

  @EventPattern(RABBITMQ_USER_UPDATED_PATTERN)
  handleUserUpdated(data: UserEventDto) {
    this.notificationsService.handleUserUpdated(data);
  }

  @EventPattern(RABBITMQ_USER_DELETED_PATTERN)
  handleUserDeleted(data: UserEventDto) {
    this.notificationsService.handleUserDeleted(data);
  }
}
