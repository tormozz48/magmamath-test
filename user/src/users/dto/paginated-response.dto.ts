import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from './user-response.dto';

/**
 * Data transfer object for paginated users API response
 */
export class PaginatedResponseDto {
  /**
   * Array of user DTOs
   */
  @ApiProperty({
    description: 'Array of user objects',
    type: [UserResponseDto],
  })
  items: UserResponseDto[];

  /**
   * Total number of users matching the filter criteria
   */
  @ApiProperty({
    description: 'Total number of users matching the filter criteria',
    example: 42,
  })
  total: number;

  /**
   * Current page number
   */
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  /**
   * Number of items per page
   */
  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  /**
   * Total number of pages
   */
  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  pages: number;
}
