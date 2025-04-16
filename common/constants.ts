export const QUEUE_NAME = 'notifications_queue';

export enum UserEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

export const userEventPattern: Partial<Record<UserEventType, string>> = {
  [UserEventType.CREATED]: 'user.created',
  [UserEventType.UPDATED]: 'user.updated',
  [UserEventType.DELETED]: 'user.deleted',
};
