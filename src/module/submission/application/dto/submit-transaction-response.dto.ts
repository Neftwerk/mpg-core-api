import { ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitTransactionResponseDto {
  @ApiPropertyOptional()
  hash?: string;

  @ApiPropertyOptional()
  successful?: boolean;

  constructor(hash: string, successful: boolean) {
    this.hash = hash;
    this.successful = successful;
  }
}
