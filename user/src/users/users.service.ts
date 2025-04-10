import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async findAll(queryUserDto: QueryUserDto): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { name, email, page = 1, limit = 10 } = queryUserDto;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter: any = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }
    if (email) {
      filter.email = { $regex: email, $options: 'i' }; // Case-insensitive search
    }

    // Execute query with pagination
    const [users, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      users,
      total,
      page,
      limit
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id, 
        updateUserDto, 
        { new: true }
      ).exec();
      
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return updatedUser;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return deletedUser;
  }
}
