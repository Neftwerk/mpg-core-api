import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

import { IServerDomainKeyValue } from '../interface/server-domain-key-value.interface';

export class AuthenticateWithVerificationCodeRequestDto {
  @ApiProperty()
  @IsObject()
  codes: IServerDomainKeyValue;
}
