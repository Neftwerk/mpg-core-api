import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';
import { fromCommaSeparatedToArray } from '@common/base/application/mapper/base.mapper';

import { Admin } from '@iam/admin/domain/admin.entity';

type AdminFields = IGetAllOptions<Admin>['fields'];

export class AdminFieldsQueryParamsDto {
  @ApiPropertyOptional()
  @IsIn(['username', 'externalId', 'roles'] as AdminFields, { each: true })
  @Transform((params) => fromCommaSeparatedToArray(params.value))
  @IsOptional()
  target?: AdminFields;
}
