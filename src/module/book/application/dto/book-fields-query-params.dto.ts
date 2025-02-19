import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { Book } from '@book/domain/book.entity';

type BookFields = IGetAllOptions<Book>['fields'];

export class BookFieldsQueryParamsDto {
  @ApiPropertyOptional()
  @IsIn(['title', 'description'] as BookFields, {
    each: true,
  })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  target?: BookFields;
}
