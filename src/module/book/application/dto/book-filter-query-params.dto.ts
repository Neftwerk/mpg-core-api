import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BookFilterQueryParamsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;
}
