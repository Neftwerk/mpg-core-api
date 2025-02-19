import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

import { FieldOptions } from '@common/base/application/interface/get-all-options.interface';
import { DtoMapper } from '@common/base/application/mapper/dto.mapper';

export class FieldsQueryParamsDto<T> {
  @Transform(({ value }) => DtoMapper.fromCommaSeparatedToArray(value))
  @IsString({ each: true })
  target?: FieldOptions<T>;
}
