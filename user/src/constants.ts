export const QUEUE_NAME = 'notifications_queue';
export const QUEUE_PATTERN_USER_CREATED = 'user.created';
export const QUEUE_PATTERN_USER_UPDATED = 'user.updated';
export const QUEUE_PATTERN_USER_DELETED = 'user.deleted';

export enum UserEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}
