import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IPagingCollectionData } from '@common/base/application/dto/collection.interface';
import {
  IBaseSerializedResponseDto,
  IDataWithSelfLink,
  ILinks,
  ISerializedData,
} from '@common/base/application/dto/serialized-response.interface';

export class ManySerializedResponseDto<ResponseDto extends object>
  implements IBaseSerializedResponseDto
{
  @ApiPropertyOptional()
  readonly data: ISerializedData<ResponseDto>[];

  @ApiProperty()
  readonly included?: IDataWithSelfLink<unknown>[];

  @ApiProperty()
  readonly links?: ILinks;

  @ApiProperty()
  readonly meta?: IPagingCollectionData;

  constructor({
    data,
    included,
    meta,
    links,
  }: {
    data: ISerializedData<ResponseDto>[];
    included?: IDataWithSelfLink<unknown>[];
    meta?: IPagingCollectionData;
    links?: ILinks;
  }) {
    this.data = data;
    this.included = included;
    this.links = links;
    this.meta = meta;
  }
}
