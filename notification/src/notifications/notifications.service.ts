import { Injectable, Logger } from '@nestjs/common';

import { UserNotificationDto } from './dto/user-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  handleUserCreated(data: UserNotificationDto) {
    this.logger.log(`User created notification received: ${JSON.stringify(data)}`);
    this.logger.log(`Sending welcome email to ${data.email}`);
  }

  handleUserUpdated(data: UserNotificationDto) {
    this.logger.log(`User updated notification received: ${JSON.stringify(data)}`);
    this.logger.log(`Sending profile update confirmation to ${data.email}`);
  }

  handleUserDeleted(data: UserNotificationDto) {
    this.logger.log(`User deleted notification received: ${JSON.stringify(data)}`);
    this.logger.log(`Sending account deletion confirmation to ${data.email}`);
  }
}
