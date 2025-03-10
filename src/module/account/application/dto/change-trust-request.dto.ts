import { AssetDto } from '@module/account/application/dto/asset.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInstance } from 'class-validator';

export class ChangeTrustRequestDto {
  @IsInstance(AssetDto)
  @ApiProperty({
    description: 'Asset to trust',
    example: {
      code: 'USD',
      issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP5DGD7TAYY5H73G4SBSEWUZ5WQUXJZQ',
    },
  })
  asset: AssetDto;
}
