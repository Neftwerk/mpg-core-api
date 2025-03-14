import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

export enum GENERATE_CHALLENGE_ERROR_MESSAGES {
  UNKNOWN_ERROR = 'Unknown error generating challenge. Please try again.',
  INVALID_SOURCE_ADDRESS = 'Invalid source address. Please try again.',
}

export class GenerateChallengeException extends InternalServerErrorException {
  constructor() {
    super(GENERATE_CHALLENGE_ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}

export class InvalidSourceAddressException extends BadRequestException {
  constructor() {
    super(GENERATE_CHALLENGE_ERROR_MESSAGES.INVALID_SOURCE_ADDRESS);
  }
}
