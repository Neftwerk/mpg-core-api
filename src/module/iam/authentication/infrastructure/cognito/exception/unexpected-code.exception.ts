import { InternalServerErrorException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

import { UNEXPECTED_ERROR_CODE_ERROR } from '@iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';

type Params = Omit<IBaseErrorInfoParams, 'message'> & { code: string };
export class UnexpectedErrorCodeException extends InternalServerErrorException {
  constructor(params: Params) {
    super({
      ...params,
      message: `${UNEXPECTED_ERROR_CODE_ERROR} - ${params.code}`,
    });
  }
}
