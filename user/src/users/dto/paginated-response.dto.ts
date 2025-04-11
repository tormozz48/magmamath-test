import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from './user-response.dto';

export class PaginatedResponseDto {
  @ApiProperty({
    description: 'Array of user objects',
    type: [UserResponseDto],
  })
  items: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users matching the filter criteria',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;
}
