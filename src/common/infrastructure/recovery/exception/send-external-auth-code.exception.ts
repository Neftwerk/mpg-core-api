import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export enum SEND_EXTERNAL_AUTH_CODE_ERROR_MESSAGES {
  INVALID_METHOD = 'Invalid validation code method. Please try again with a different method',
  UNKNOWN_ERROR = 'Unknown error sending verification code. Please try again',
}

export class InvalidValidationCodeMethodException extends NotFoundException {
  constructor() {
    super(SEND_EXTERNAL_AUTH_CODE_ERROR_MESSAGES.INVALID_METHOD);
  }
}

export class SendVerificationCodeException extends InternalServerErrorException {
  constructor() {
    super(SEND_EXTERNAL_AUTH_CODE_ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}
