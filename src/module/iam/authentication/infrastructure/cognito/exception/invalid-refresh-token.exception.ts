import { UnauthorizedException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor(params: IBaseErrorInfoParams) {
    const pointer = params.pointer ?? '/refreshSession/code';
    super({
      ...params,
      pointer,
    });
  }
}
