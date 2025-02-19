import { NotFoundException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

export class BookNotFoundException extends NotFoundException {
  constructor(params: IBaseErrorInfoParams) {
    super(params);
  }
}
