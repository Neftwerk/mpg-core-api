import { BadRequestException } from '@nestjs/common';

export class InvalidPublicKeyException extends BadRequestException {
  constructor() {
    super('Invalid public key');
  }
}
