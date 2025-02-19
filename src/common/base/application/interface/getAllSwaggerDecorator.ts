import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiQuery, ApiResponse } from '@nestjs/swagger';
import 'reflect-metadata';

import { getDtoProperties } from '@common/base/application/dto/base.dto';
import { IDto } from '@common/base/application/dto/dto.interface';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { FieldsQueryParamsDto } from '@common/base/application/dto/query-param/fields-query-params.dto';
import { FilterOptions } from '@common/base/application/interface/get-all-options.interface';

export function GetAllSwaggerDecorator<
  EntityDto extends IDto,
  FilterDto extends FilterOptions<EntityDto>,
  FieldsDto extends FieldsQueryParamsDto<EntityDto>,
>(
  ResponseDto: new (...props: any) => EntityDto,
  FilterQueryDto: new (...props: any) => FilterDto,
  FieldsQueryDto: new (...props: any) => FieldsDto,
) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'The operation has been successful.',
    }),
    ApiResponse({ status: 403, description: 'Forbidden.' }),
    ApiExtraModels(PageQueryParamsDto),
    ApiExtraModels(FilterQueryDto),
    ApiQuery({
      name: 'page',
      required: false,
      type: () => PageQueryParamsDto,
    }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: () => FilterQueryDto,
    }),
    ApiQuery({
      name: 'fields',
      required: false,
      type: () => FieldsQueryDto,
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      isArray: true,
      description: 'Sort by property name in ascending or descending order',
      example: 'sort[name]=ASC',
      enum: getDtoProperties(ResponseDto).flatMap((prop) => [
        `${prop}=ASC`,
        `${prop}=DESC`,
      ]),
    }),
  );
}
