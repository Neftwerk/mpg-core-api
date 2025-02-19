import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { BookRelation } from '@book/application/enum/book-relations.enum';

export class BookIncludeQueryParamsDto {
  @ApiPropertyOptional({
    enum: BookRelation,
    isArray: true,
  })
  @IsIn(Object.values(BookRelation), {
    each: true,
  })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  target?: BookRelation[];
}
