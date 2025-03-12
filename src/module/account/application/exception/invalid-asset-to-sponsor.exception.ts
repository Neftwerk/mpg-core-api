import { BadRequestException } from '@nestjs/common';

export class InvalidAssetToSponsorException extends BadRequestException {
  constructor() {
    super(`Invalid asset to sponsor`);
  }
}
