/**
 * Data transfer object for user events received from RabbitMQ
 */
export class UserEventDto {
  /**
   * User ID
   */
  id: string;

  /**
   * User name
   */
  name: string;

  /**
   * User email
   */
  email: string;

  /**
   * User creation date
   */
  createdAt: Date;
}
