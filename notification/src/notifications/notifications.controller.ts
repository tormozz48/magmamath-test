import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import {
  QUEUE_PATTERN_USERS_CREATED,
  QUEUE_PATTERN_USERS_DELETED,
  QUEUE_PATTERN_USERS_UPDATED,
} from '../constants';
import { UserEventDto } from './dto/user-event.dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(QUEUE_PATTERN_USERS_CREATED)
  handleUserCreated(data: UserEventDto) {
    this.notificationsService.handleUserCreated(data);
  }

  @EventPattern(QUEUE_PATTERN_USERS_UPDATED)
  handleUserUpdated(data: UserEventDto) {
    this.notificationsService.handleUserUpdated(data);
  }

  @EventPattern(QUEUE_PATTERN_USERS_DELETED)
  handleUserDeleted(data: UserEventDto) {
    this.notificationsService.handleUserDeleted(data);
  }
}
