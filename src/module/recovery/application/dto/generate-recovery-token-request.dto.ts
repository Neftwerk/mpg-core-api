import { IServerDomainKeyValue } from '@module/recovery/application/interface/server-domain-key-value.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class GenerateRecoveryTokenDto {
  @ApiProperty({
    description:
      'An object containing signed challenges, where the keys are server URLs and the values are signed challenges.',
    example: {
      'Recovery-1-Domain': 'signedChallenge1',
      'Recovery-2-Domain': 'signedChallenge2',
    },
  })
  @IsObject()
  signedChallenges: IServerDomainKeyValue;
}
