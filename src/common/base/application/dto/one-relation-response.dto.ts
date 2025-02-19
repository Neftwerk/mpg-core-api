import { ApiProperty } from '@nestjs/swagger';

import { OneRelationResponseData } from '@common/base/application/dto/one-relation-response.interface.dto';
import { ILinks } from '@common/base/application/dto/serialized-response.interface';

export class OneRelationResponseDto {
  @ApiProperty()
  data: OneRelationResponseData;

  @ApiProperty()
  links: Omit<ILinks, 'last' | 'next'>;
}
