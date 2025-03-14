import { InternalServerErrorException } from '@nestjs/common';

export enum GENERATE_SIGNATURE_ERROR_MESSAGES {
  UNKNOWN_ERROR = 'Unknown error generating signature. Please try again.',
  USER_NOT_FOUND = 'User not found',
}

export class GenerateSignatureException extends InternalServerErrorException {
  constructor() {
    super(GENERATE_SIGNATURE_ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}
