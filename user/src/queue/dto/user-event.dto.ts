import { UserDocument } from '../../users/schemas/user.schema';

export class UserEventDto {
  id: string;
  name: string;
  email: string;
  createdAt: Date;

  static fromEntity(user: UserDocument): UserEventDto {
    const dto = new UserEventDto();
    dto.id = user._id.toString();
    dto.name = user.name;
    dto.email = user.email;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
