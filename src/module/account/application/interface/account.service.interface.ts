import { AssetDto } from '@module/account/application/dto/asset.dto';
import { XdrResponseDto } from '@module/account/application/dto/xdr.response.dto';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';

export interface IAccountService {
  buildTrustlines(
    assetDto: AssetDto,
    masterKey: string,
  ): Promise<OneSerializedResponseDto<XdrResponseDto>>;

  handleCreateAccount(
    masterKey: string,
    currentMasterKey: string,
  ): Promise<OneSerializedResponseDto<XdrResponseDto>>;
}
