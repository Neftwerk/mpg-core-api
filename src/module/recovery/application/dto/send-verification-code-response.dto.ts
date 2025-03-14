import { IServerDomainKeyValue } from '@module/recovery/application/interface/server-domain-key-value.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class SendVerificationCodeResponseDto {
  @ApiProperty({
    description:
      'An array containing the order of the servers that send the verification code with the method type',
    example: {
      servers: {
        'Recovery-1-Domain': 'email',
        'Recovery-2-Domain': 'email',
      },
    },
    type: Array,
  })
  @IsObject()
  servers: IServerDomainKeyValue;
}
