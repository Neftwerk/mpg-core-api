import { InternalServerErrorException } from '@nestjs/common';

export enum GENERATE_TOKEN_ERROR_MESSAGES {
  UNKNOWN_ERROR = 'Unknown error generating token. Please try again.',
}

export class GenerateTokenException extends InternalServerErrorException {
  constructor() {
    super(GENERATE_TOKEN_ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}
