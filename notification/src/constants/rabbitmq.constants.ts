export const RABBITMQ_QUEUE = 'notifications_queue';
export const RABBITMQ_USER_CREATED_PATTERN = 'user.created';
export const RABBITMQ_USER_UPDATED_PATTERN = 'user.updated';
export const RABBITMQ_USER_DELETED_PATTERN = 'user.deleted';

export enum UserEventType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}
