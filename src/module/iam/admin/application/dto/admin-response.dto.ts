import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EntityName } from '@common/decorators/entity-name.decorator';

import { ADMIN_ENTITY_NAME } from '@iam/admin/domain/admin.name';

@EntityName(ADMIN_ENTITY_NAME)
export class AdminResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  externalId?: string;

  @ApiProperty({ type: [String] })
  roles: string[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  deletedAt?: string;
}
