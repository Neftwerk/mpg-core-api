import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export enum REGISTER_ACCOUNT_ERROR_MESSAGES {
  INVALID_FIELD = 'Invalid field. Please check and try again',
  USER_NOT_FOUND = 'User not found',
  USER_ALREADY_EXISTS = 'User already exists',
  UNKNOWN_ERROR = 'Unknown error registering account. Please try again',
}

export class InvalidFieldException extends BadRequestException {
  constructor() {
    super(REGISTER_ACCOUNT_ERROR_MESSAGES.INVALID_FIELD);
  }
}

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super(REGISTER_ACCOUNT_ERROR_MESSAGES.USER_NOT_FOUND);
  }
}

export class UserAlreadyExistsException extends ConflictException {
  constructor() {
    super(REGISTER_ACCOUNT_ERROR_MESSAGES.USER_ALREADY_EXISTS);
  }
}

export class RegisterAccountException extends InternalServerErrorException {
  constructor() {
    super(REGISTER_ACCOUNT_ERROR_MESSAGES.UNKNOWN_ERROR);
  }
}
