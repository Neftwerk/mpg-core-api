import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Asset, Horizon, Keypair, Operation } from '@stellar/stellar-sdk';

import { STELLAR_OPERATION_SORT_TYPE } from '@common/base/application/enum/stellar-operation-sort-type.enum';
import { IAddSignerOptions } from '@common/infrastructure/stellar/interface/add-signers-options.interface';
import { ISetAccountWeightsProps } from '@common/infrastructure/stellar/interface/set-account-weights.interface';

@Injectable()
export class StellarAccountAdapter {
  private readonly stellarServer: Horizon.Server;
  private readonly STROOPS_PER_LUMEN = 10_000_000;
  private readonly MINIMUM_BALANCE_MULTIPLIER = 2;

  constructor(private readonly environmentConfig: ConfigService) {
    const serverUrl = this.environmentConfig.get('stellar.serverUrl');
    this.stellarServer = new Horizon.Server(serverUrl, {
      allowHttp: true,
    });
  }

  async getAccount(publicKey: string): Promise<Horizon.AccountResponse> {
    return await this.stellarServer.loadAccount(publicKey);
  }

  getKeypair(secretKey: string): Keypair {
    return Keypair.fromSecret(secretKey);
  }

  setAccountSettings({
    lowThreshold,
    medThreshold,
    highThreshold,
    masterWeight,
  }: ISetAccountWeightsProps): string {
    return Operation.setOptions({
      lowThreshold,
      medThreshold,
      highThreshold,
      masterWeight,
    }).toXDR('base64');
  }

  async getOperations(
    publicKey: string,
    order: STELLAR_OPERATION_SORT_TYPE,
  ): Promise<Horizon.ServerApi.OperationRecord[]> {
    const { records } = await this.stellarServer
      .operations()
      .forAccount(publicKey)
      .order(order)
      .call();
    return records;
  }

  addAccountSigners(options: IAddSignerOptions): string {
    return Operation.setOptions(options).toXDR('base64');
  }

  createBeginSponsoringFutureReservesOperation(
    publicKey: string,
    source: string,
  ): string {
    return Operation.beginSponsoringFutureReserves({
      sponsoredId: publicKey,
      source,
    }).toXDR('base64');
  }

  createEndSponsoringFutureReservesOperation(publicKey: string): string {
    return Operation.endSponsoringFutureReserves({
      source: publicKey,
    }).toXDR('base64');
  }

  createChangeTrustOperation(publicKey: string, asset: Asset): string {
    return Operation.changeTrust({
      source: publicKey,
      asset,
    }).toXDR('base64');
  }

  createSponsoredAccount(
    publicKey: string,
    startingBalance: string,
    sponsorPublicKey: string,
  ): string {
    return Operation.createAccount({
      destination: publicKey,
      startingBalance,
      source: sponsorPublicKey,
    }).toXDR('base64');
  }

  async getMinimumBalance(subentryCount: number): Promise<number> {
    const baseReserve = await this.getBaseReserve();

    return (this.MINIMUM_BALANCE_MULTIPLIER + subentryCount) * baseReserve;
  }

  private async getBaseReserve(): Promise<number> {
    const networkDetails = await this.stellarServer
      .ledgers()
      .order('desc')
      .limit(1)
      .call();
    return (
      networkDetails.records[0].base_reserve_in_stroops / this.STROOPS_PER_LUMEN
    );
  }
}
