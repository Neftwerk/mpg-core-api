import { AccountResponseAdapter } from '@module/account/application/adapter/account-responser.adapter';
import { AssetDto } from '@module/account/application/dto/asset.dto';
import { XdrResponseDto } from '@module/account/application/dto/xdr.response.dto';
import { BuildTrustlinesException } from '@module/account/application/exception/build-trustlines.exception';
import { CreateAccountException } from '@module/account/application/exception/create-account.exception';
import { UserAlreadyHasMasterKeyException } from '@module/account/application/exception/user-already-has-master-key.exception';
import { IAccountService } from '@module/account/application/interface/account.service.interface';
import { ASSET_CODE } from '@module/account/domain/asset-code.enum';
import { XDR_ENTITY_NAME } from '@module/account/domain/xdr.name';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Asset } from '@stellar/stellar-sdk';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar.account.adapter';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar.transaction.adapter';

@Injectable()
export class AccountService implements IAccountService {
  private readonly stellarOrganizationPublicKeySponsorAccount: string;
  private readonly initialXlmBalanceOfSponsoredAccount: string;
  private readonly stellarOrganizationSecretKeySponsorAccount: string;
  private readonly usdcAsset: Asset;

  constructor(
    private readonly stellarAccountAdapter: StellarAccountAdapter,
    private readonly stellarTransactionAdapter: StellarTransactionAdapter,
    private readonly accountResponseAdapter: AccountResponseAdapter,
    private readonly environmentConfig: ConfigService,
  ) {
    this.stellarOrganizationPublicKeySponsorAccount =
      this.environmentConfig.get('stellar.organizationPublicKeySponsorAccount');
    this.initialXlmBalanceOfSponsoredAccount = this.environmentConfig.get(
      'stellar.initialXlmBalanceOfSponsoredAccount',
    );
    this.stellarOrganizationSecretKeySponsorAccount =
      this.environmentConfig.get('stellar.organizationSecretKeySponsorAccount');
    this.usdcAsset = this.stellarTransactionAdapter.buildAsset(
      ASSET_CODE.USDC,
      this.environmentConfig.get('stellar.usdcAssetIssuer'),
    );
  }

  async buildTrustlines(
    { assetCode, assetIssuer }: AssetDto,
    masterKey: string,
  ): Promise<OneSerializedResponseDto<XdrResponseDto>> {
    try {
      const buildedAsset = this.stellarTransactionAdapter.buildAsset(
        assetCode,
        assetIssuer,
      );
      const trustlineOperation =
        this.stellarAccountAdapter.createChangeTrustOperation(
          masterKey,
          buildedAsset,
        );
      const trustlineTransaction =
        await this.stellarTransactionAdapter.buildTransaction(masterKey, [
          trustlineOperation,
        ]);

      return this.accountResponseAdapter.oneEntityResponseStellar<XdrResponseDto>(
        XDR_ENTITY_NAME,
        { xdr: trustlineTransaction },
      );
    } catch (error) {
      throw new BuildTrustlinesException(
        error.response.detail ?? error.message,
      );
    }
  }

  async handleCreateAccount(
    masterKey: string,
    currentMasterKey: string,
  ): Promise<OneSerializedResponseDto<XdrResponseDto>> {
    try {
      if (currentMasterKey) throw new UserAlreadyHasMasterKeyException();

      const sponsorSignedTransaction =
        await this.createSponsoredAccountTransaction(masterKey);

      return this.accountResponseAdapter.oneEntityResponseStellar<XdrResponseDto>(
        XDR_ENTITY_NAME,
        { xdr: sponsorSignedTransaction },
      );
    } catch (error) {
      throw new CreateAccountException(error.response.detail ?? error.message);
    }
  }

  private async createSponsoredAccountTransaction(
    accountToSponsor: string,
  ): Promise<string> {
    const startSponsoringFutureReservesOperation =
      this.stellarAccountAdapter.createBeginSponsoringFutureReservesOperation(
        accountToSponsor,
        this.stellarOrganizationPublicKeySponsorAccount,
      );

    const endSponsoringFutureReservesOperation =
      this.stellarAccountAdapter.createEndSponsoringFutureReservesOperation(
        accountToSponsor,
      );

    const sponsoredAccountOperation =
      this.stellarAccountAdapter.createSponsoredAccount(
        accountToSponsor,
        this.initialXlmBalanceOfSponsoredAccount,
        this.stellarOrganizationPublicKeySponsorAccount,
      );

    const trustlineOperation =
      this.stellarAccountAdapter.createChangeTrustOperation(
        accountToSponsor,
        this.usdcAsset,
      );

    const operations = [
      startSponsoringFutureReservesOperation,
      sponsoredAccountOperation,
      trustlineOperation,
      endSponsoringFutureReservesOperation,
    ];

    const createAccountTransaction =
      await this.stellarTransactionAdapter.buildTransaction(
        this.stellarOrganizationPublicKeySponsorAccount,
        operations,
      );

    const sponsorKeyPair = this.stellarAccountAdapter.getKeypair(
      this.stellarOrganizationSecretKeySponsorAccount,
    );

    return this.stellarTransactionAdapter.signTransaction(
      sponsorKeyPair,
      createAccountTransaction,
    );
  }
}
