import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RecoverAccountRequestDto {
  @ApiProperty()
  @IsString()
  newDeviceKey: string;
}
