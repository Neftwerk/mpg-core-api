import { AUTH_METHOD_TYPE } from '@module/recovery/application/enum/auth-method-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class GetVerificationCodeRequestDto {
  @ApiProperty()
  @IsEnum(AUTH_METHOD_TYPE)
  method: AUTH_METHOD_TYPE;
}
