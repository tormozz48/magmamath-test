import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z\\s]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100, { message: 'Name must be between 1 and 100 characters' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name must contain only English letters and spaces',
  })
  readonly name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'The age of the user',
    example: 30,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  readonly age?: number;
}
