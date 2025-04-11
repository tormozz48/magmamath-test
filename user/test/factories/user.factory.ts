import { faker } from '@faker-js/faker';

import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';

// Create a function to generate CreateUserDto objects
export const createUserDto = (overrides: Partial<CreateUserDto> = {}): CreateUserDto => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    ...overrides,
  };
};

// Create a function to generate UpdateUserDto objects
export const updateUserDto = (overrides: Partial<UpdateUserDto> = {}): UpdateUserDto => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    ...overrides,
  };
};

// Helper function to create a unique email based on timestamp
export const createUniqueEmail = (prefix = 'test'): string => {
  const timestamp = new Date().getTime();
  return `${prefix}${timestamp}@example.com`;
};
