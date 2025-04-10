import { UserDocument } from '../../users/schemas/user.schema';

/**
 * Data transfer object for user events published to RabbitMQ
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

  /**
   * Create a UserEventDto from a UserDocument
   * @param user User document to convert
   * @returns UserEventDto instance
   */
  static fromEntity(user: UserDocument): UserEventDto {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
