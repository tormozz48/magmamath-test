import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { UserEventType } from '../constants';
import { QueueService } from '../queue/queue.service';
import { handleDuplicationMongoErrors } from '../utils';
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

  async find(
    queryUserDto: QueryUserDto,
  ): Promise<{ items: UserDocument[]; total: number; page: number; limit: number }> {
    const { name, email, page = 1, limit = 10 } = queryUserDto;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
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
    return handleDuplicationMongoErrors(async () => {
      const createdUser = new this.userModel(createUserDto);
      const user = await createdUser.save();

      await this.queueService.publishUserEvent(user, UserEventType.CREATED);
      return user;
    }, 'User with this email already exists');
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    return handleDuplicationMongoErrors(async () => {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.queueService.publishUserEvent(updatedUser, UserEventType.UPDATED);
      return updatedUser;
    }, 'Email already in use');
  }

  async remove(id: string): Promise<UserDocument> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.queueService.publishUserEvent(deletedUser, UserEventType.DELETED);
    return deletedUser;
  }
}
