import { Injectable, Logger } from '@nestjs/common';

import { UserEventDto } from './dto/user-event.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  /**
   * Handle user created event
   * @param data User event data
   */
  handleUserCreated(data: UserEventDto) {
    this.handleEvent(data);
    this.logger.log(`User created notification received: ${JSON.stringify(data)}`);
    this.logger.log(`Sending welcome email to ${data.email}`);
  }

  /**
   * Handle user updated event
   * @param data User event data
   */
  handleUserUpdated(data: UserEventDto) {
    this.handleEvent(data);
    this.logger.log(`User updated notification received: ${JSON.stringify(data)}`);
    this.logger.log(`Sending profile update confirmation to ${data.email}`);
  }

  /**
   * Handle user deleted event
   * @param data User event data
   */
  handleUserDeleted(data: UserEventDto) {
    this.handleEvent(data);
    this.logger.log(`User deleted notification received: ${JSON.stringify(data)}`);
    this.logger.log(`Sending account deletion confirmation to ${data.email}`);
  }

  handleEvent(data: UserEventDto) {
    this.logger.log(`User event received: ${JSON.stringify(data)}`);
    // TODO: Implement notification logic
  }
}
