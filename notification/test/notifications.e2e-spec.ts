import { UserEventType, userEventPattern } from '../../common/constants';
import { NotificationsService } from '../src/notifications/notifications.service';
import { app, rabbitMQHelper } from './setup';

describe('NotificationsController (e2e)', () => {
  const testUser = {
    id: '12345',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle user.created event', async () => {
    const notificationsService = app.get<NotificationsService>(NotificationsService);
    const handleEventSpy = jest.spyOn(notificationsService, 'handleEvent');
    const handleUserCreatedSpy = jest.spyOn(notificationsService, 'handleUserCreated');

    await rabbitMQHelper.publishEvent(userEventPattern[UserEventType.CREATED], testUser);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(handleUserCreatedSpy).toHaveBeenCalledWith(testUser);
    expect(handleEventSpy).toHaveBeenCalledWith(testUser);
  });

  it('should handle user.updated event', async () => {
    const notificationsService = app.get<NotificationsService>(NotificationsService);
    const handleEventSpy = jest.spyOn(notificationsService, 'handleEvent');
    const handleUserUpdatedSpy = jest.spyOn(notificationsService, 'handleUserUpdated');

    await rabbitMQHelper.publishEvent(userEventPattern[UserEventType.UPDATED], testUser);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(handleUserUpdatedSpy).toHaveBeenCalledWith(testUser);
    expect(handleEventSpy).toHaveBeenCalledWith(testUser);
  });

  it('should handle user.deleted event', async () => {
    const notificationsService = app.get<NotificationsService>(NotificationsService);
    const handleEventSpy = jest.spyOn(notificationsService, 'handleEvent');
    const handleUserDeletedSpy = jest.spyOn(notificationsService, 'handleUserDeleted');

    await rabbitMQHelper.publishEvent(userEventPattern[UserEventType.DELETED], testUser);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(handleUserDeletedSpy).toHaveBeenCalledWith(testUser);
    expect(handleEventSpy).toHaveBeenCalledWith(testUser);
  });
});
