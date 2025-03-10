import { BadRequestException } from '@nestjs/common';

export class BuildTrustlinesException extends BadRequestException {
  constructor(error: string) {
    super(`Error building trustlines: ${error}`);
  }
}
