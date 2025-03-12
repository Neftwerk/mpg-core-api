import { InternalServerErrorException } from '@nestjs/common';

export class CreateAccountException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
  }
}
