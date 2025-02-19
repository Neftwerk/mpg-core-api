import { UnauthorizedException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

export class InvalidPasswordException extends UnauthorizedException {
  constructor(params: IBaseErrorInfoParams) {
    super(params);
  }
}
