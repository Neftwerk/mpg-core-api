import { ForbiddenException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

export class UserNotConfirmedException extends ForbiddenException {
  constructor(params: IBaseErrorInfoParams) {
    super(params);
  }
}
