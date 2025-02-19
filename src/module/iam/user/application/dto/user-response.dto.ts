import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EntityName } from '@common/decorators/entity-name.decorator';

import { USER_ENTITY_NAME } from '@iam/user/domain/user.name';

@EntityName(USER_ENTITY_NAME)
export class UserResponseDto {
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
