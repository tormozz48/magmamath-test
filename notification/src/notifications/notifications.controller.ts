import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import { UserEventType, userEventPattern } from '../../../common/constants';
import { UserEventDto } from '../../../common/dto/user-event.dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(userEventPattern[UserEventType.CREATED])
  handleUserCreated(data: UserEventDto) {
    this.notificationsService.handleUserCreated(data);
  }

  @EventPattern(userEventPattern[UserEventType.UPDATED])
  handleUserUpdated(data: UserEventDto) {
    this.notificationsService.handleUserUpdated(data);
  }

  @EventPattern(userEventPattern[UserEventType.DELETED])
  handleUserDeleted(data: UserEventDto) {
    this.notificationsService.handleUserDeleted(data);
  }
}
