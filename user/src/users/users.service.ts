import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find user with ID ${id}`);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to find user with email ${email}`);
    }
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 11000) {
        throw new ConflictException('Email already in use');
      }
      throw new InternalServerErrorException(`Failed to update user with ID ${id}`);
    }
  }

  async remove(id: string): Promise<User> {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      
      if (!deletedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return deletedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete user with ID ${id}`);
    }
  }
}
