import { IsOptional, IsString, IsNumber, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1)
  limit?: number = 10;
}
