import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export enum UPDATE_IDENTITY_ERROR_MESSAGES {
  UNKNOWN_ERROR = 'Unknown error updating identity. Please try again',
  UNAUTHORIZED = 'You are not authorized to update the identity',
  USER_NOT_FOUND = 'User not found to update identity',
}

export class UpdateIdentityUnauthorizedException extends UnauthorizedException {
  constructor() {
    super(UPDATE_IDENTITY_ERROR_MESSAGES.UNAUTHORIZED);
  }
}

export class UpdateIdentityException extends InternalServerErrorException {
  constructor() {
    super(UPDATE_IDENTITY_ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}

export class UserNotFoundToUpdateException extends NotFoundException {
  constructor() {
    super(UPDATE_IDENTITY_ERROR_MESSAGES.USER_NOT_FOUND);
  }
}
