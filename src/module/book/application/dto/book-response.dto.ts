import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EntityName } from '@common/decorators/entity-name.decorator';

import { BOOK_ENTITY_NAME } from '@book/domain/book.name';

import { Genre } from '@genre/domain/genre.entity';

@EntityName(BOOK_ENTITY_NAME)
export class BookResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  uuid: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  deletedAt?: string;

  @ApiPropertyOptional()
  genre?: Genre;
}
