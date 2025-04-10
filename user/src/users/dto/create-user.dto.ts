import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100, { message: 'Name must be between 1 and 100 characters' })
  @Matches(/^[a-zA-Z\s]+$/, { 
    message: 'Name must contain only English letters and spaces'
  })
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsNumber()
  @IsOptional()
  readonly age?: number;
}
