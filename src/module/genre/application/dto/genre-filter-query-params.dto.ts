import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GenreFilterQueryParamsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}
