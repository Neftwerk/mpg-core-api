import { BadRequestException } from '@nestjs/common';

export class UserAlreadyHasMasterKeyException extends BadRequestException {
  constructor() {
    super(`Error creating account: User already has master key`);
  }
}
