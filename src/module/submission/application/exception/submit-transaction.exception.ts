import { InternalServerErrorException } from '@nestjs/common';

export class SubmitTransactionException extends InternalServerErrorException {
  constructor(error: string) {
    super(`Error submitting transaction: ${error}`);
  }
}
