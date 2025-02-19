import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminFilterQueryParamsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username?: string;
}
