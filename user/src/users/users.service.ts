import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { QueueService } from '../queue/queue.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly queueService: QueueService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const createdUser = new this.userModel(createUserDto);
      const user = await createdUser.save();
      const userDto = this.toUserDto(user);

      // Publish user created event to RabbitMQ
      await this.queueService.publishUserCreated(userDto);

      return userDto;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async findAll(queryUserDto: QueryUserDto): Promise<UserResponseDto[]> {
    const { name, email, page = 1, limit = 10 } = queryUserDto;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    const users = await this.userModel.find(filter).skip(skip).limit(limit).exec();

    return this.toUserDtoArray(users);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toUserDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const userDto = this.toUserDto(updatedUser);

      // Publish user updated event to RabbitMQ
      await this.queueService.publishUserUpdated(userDto);

      return userDto;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<UserResponseDto> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const userDto = this.toUserDto(deletedUser);

    // Publish user deleted event to RabbitMQ
    await this.queueService.publishUserDeleted(userDto);

    return userDto;
  }

  /**
   * Convert a MongoDB user document to a UserResponseDto
   */
  private toUserDto(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  /**
   * Convert an array of MongoDB user documents to UserResponseDto array
   */
  private toUserDtoArray(users: UserDocument[]): UserResponseDto[] {
    return users.map((user) => this.toUserDto(user));
  }
}
