import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { IsStellarPublicKey } from '@common/infrastructure/stellar/decorator/is-public-key.decorator';

export class CreateWalletRequestDto {
  @ApiProperty({
    description: 'Master key',
    example:
      'GABK234234234234234234234234234234234234234234234234234234234234234',
  })
  @IsStellarPublicKey()
  @IsNotEmpty()
  masterKey: string;
}
