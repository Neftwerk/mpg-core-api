import { IServerDomainKeyValue } from '@module/recovery/application/interface/server-domain-key-value.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class CreateSignerRequestDto {
  @ApiProperty({
    description: 'An object containing the signer for the server',
    example: {
      signers: {
        'Recovery-1-Domain':
          'GCF3TQXKZJNFJK7HCMNE2O2CUNKCJH2Y2ROISTBPLC7C5EIA5NNG2XZB',
        'Recovery-2-Domain':
          'GCF3TQXKZJNFJK7HCMNE2O2CUNKCJH2Y2ROISTBPLC7C5EIA5NNG2XZB',
      },
    },
    type: Object,
  })
  @IsObject()
  signers: IServerDomainKeyValue;
}
