import { InternalServerErrorException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

export class UnknownErrorException extends InternalServerErrorException {
  constructor(params: IBaseErrorInfoParams) {
    super(params);
  }
}
