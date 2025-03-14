import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfigureAccountRecoveryRequestDto {
  @ApiProperty()
  @IsString()
  deviceKey: string;
}
