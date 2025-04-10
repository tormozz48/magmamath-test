import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { QueueService } from '../queue/queue.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly queueService: QueueService,
  ) {}

  async findAll(
    queryUserDto: QueryUserDto,
  ): Promise<{ items: UserDocument[]; total: number; page: number; limit: number; pages: number }> {
    const { name, email, page = 1, limit = 10 } = queryUserDto;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    // Execute both queries in parallel for better performance
    const [items, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      pages,
    };
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    return this.handleDuplicationMongoErrors(async () => {
      const createdUser = new this.userModel(createUserDto);
      const user = await createdUser.save();

      // Publish user created event to RabbitMQ
      await this.queueService.publishUserCreated(user);

      return user;
    }, 'User with this email already exists');
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    return this.handleDuplicationMongoErrors(async () => {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Publish user updated event to RabbitMQ
      await this.queueService.publishUserUpdated(updatedUser);

      return updatedUser;
    }, 'Email already in use');
  }

  async remove(id: string): Promise<UserDocument> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Publish user deleted event to RabbitMQ
    await this.queueService.publishUserDeleted(deletedUser);

    return deletedUser;
  }

  /**
   * Handle common MongoDB errors, particularly duplicate key errors (code 11000)
   * @param operation Async operation to execute
   * @param duplicateKeyMessage Custom message for duplicate key errors
   * @returns Result of the operation
   */
  private async handleDuplicationMongoErrors<T>(
    operation: () => Promise<T>,
    duplicateKeyMessage: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(duplicateKeyMessage);
      }
      throw error;
    }
  }
}
