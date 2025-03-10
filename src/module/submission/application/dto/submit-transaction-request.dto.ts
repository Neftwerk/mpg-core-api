import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubmitTransactionRequestDto {
  @IsString()
  @ApiProperty()
  xdr: string;
}
