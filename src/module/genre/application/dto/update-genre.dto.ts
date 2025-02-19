import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreateGenreDto } from '@genre/application/dto/create-genre.dto';

export class UpdateGenreDto extends PartialType(CreateGenreDto) {
  @IsString()
  @IsOptional()
  name?: string;
}
