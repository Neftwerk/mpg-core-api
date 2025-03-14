import { IServerDomainKeyValue } from '@module/recovery/application/interface/server-domain-key-value.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class ConfigureAccountRecoveryResponseDto {
  @ApiProperty({
    description:
      'XDR transaction containing new weight and signers for the account',
    type: String,
  })
  @IsString()
  xdr: string;

  @ApiProperty({
    description: 'Signers for the account provided by the SEP30 servers',
    type: Object,
  })
  @IsObject()
  signers: IServerDomainKeyValue;
}
