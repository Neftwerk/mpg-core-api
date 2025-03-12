import { XDR_ENTITY_NAME } from '@module/account/domain/xdr.name';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { EntityName } from '@common/decorators/entity-name.decorator';

@EntityName(XDR_ENTITY_NAME)
export class XdrResponseDto {
  @ApiProperty({
    description: 'XDR transaction',
    example: 'AAADrmfeWfWE!123DQWXDREXAMPLE',
  })
  @IsString()
  @IsNotEmpty()
  xdr: string;

  constructor(xdr: string) {
    this.xdr = xdr;
  }
}
