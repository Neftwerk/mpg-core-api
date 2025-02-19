import { IsInt, IsOptional, Max, Min } from 'class-validator';

import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '@common/base/base.constants';

export class PageQueryParamsDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  number?: number = DEFAULT_PAGE_NUMBER;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  size?: number = DEFAULT_PAGE_SIZE;

  get offset(): number {
    return (this.number - 1) * this.size;
  }
}
