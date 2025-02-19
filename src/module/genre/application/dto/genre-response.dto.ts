import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EntityName } from '@common/decorators/entity-name.decorator';

import { GENRE_ENTITY_NAME } from '@genre/domain/genre.name';

@EntityName(GENRE_ENTITY_NAME)
export class GenreResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  deletedAt?: string;
}
