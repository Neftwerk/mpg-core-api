import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export enum EXTERNAL_AUTH_ERROR_MESSAGES {
  VALIDATION_CODE_EXPIRED = 'Validation code expired. Ask for another code',
  INVALID_METHOD = 'Invalid validation code method. Please try again with a different method',
  TOO_MANY_REQUESTS = 'Too many validation attempts, ask for another code',
  UNKNOWN_ERROR = 'Unknown error authenticating with external auth code. Please try again',
}

export class ValidationCodeExpiredException extends BadRequestException {
  constructor() {
    super(EXTERNAL_AUTH_ERROR_MESSAGES.VALIDATION_CODE_EXPIRED);
  }
}

export class InvalidValidationCodeMethodException extends NotFoundException {
  constructor() {
    super(EXTERNAL_AUTH_ERROR_MESSAGES.INVALID_METHOD);
  }
}

export class TooManyValidationAttemptsException extends HttpException {
  constructor() {
    super(
      EXTERNAL_AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class AuthenticateWithExternalAuthCodeException extends InternalServerErrorException {
  constructor() {
    super(EXTERNAL_AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}
