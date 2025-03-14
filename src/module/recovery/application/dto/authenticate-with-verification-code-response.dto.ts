import { IServerDomainKeyValue } from '@module/recovery/application/interface/server-domain-key-value.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class AuthenticateWithVerificationCodeResponseDto {
  @ApiProperty({
    description:
      'An object containing external auth tokens provided by SEP30 servers',
    example: {
      externalAuthTokens: {
        'Recovery-1-Domain': 'token',
        'Recovery-2-Domain': 'token',
      },
    },
    type: Object,
  })
  @IsObject()
  externalAuthTokens: IServerDomainKeyValue;
}
