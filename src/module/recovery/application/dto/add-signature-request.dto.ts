import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddSignatureRequestDto {
  @ApiProperty()
  @IsString()
  transaction: string;
}
