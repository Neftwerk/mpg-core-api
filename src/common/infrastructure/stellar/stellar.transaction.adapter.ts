import { ASSET_CODE } from '@module/account/domain/asset-code.enum';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Asset,
  Horizon,
  Keypair,
  Memo,
  MemoHash,
  MemoNone,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';

import { IAddSignature } from '@common/infrastructure/stellar/interface/IAddSignature.interface';

@Injectable()
export class StellarTransactionAdapter {
  private readonly stellarServer: Horizon.Server;
  private readonly networkPassphrase: string;

  constructor(private readonly environmentConfig: ConfigService) {
    const serverUrl = this.environmentConfig.get('stellar.serverUrl');
    this.networkPassphrase = this.environmentConfig.get(
      'stellar.networkPassphrase',
    );
    this.stellarServer = new Horizon.Server(serverUrl, {
      allowHttp: true,
    });
  }

  async buildTransaction(
    publicKey: string,
    operations: string[],
    memo?: string,
  ): Promise<string> {
    const sourceAccount = await this.stellarServer.loadAccount(publicKey);

    const currentFee = (await this.stellarServer.feeStats()).fee_charged.p90;

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: String(+currentFee * operations.length),
      networkPassphrase: this.networkPassphrase,
    }).setTimeout(180);

    for (const operationXdr of operations) {
      const operation = xdr.Operation.fromXDR(operationXdr, 'base64');
      transaction.addOperation(operation);

      if (memo) {
        transaction.addMemo(new Memo(MemoHash, memo));
      } else {
        transaction.addMemo(new Memo(MemoNone));
      }
    }
    return transaction.build().toXDR();
  }

  buildAsset(assetCode: string, assetIssuer?: string): Asset {
    return assetCode === ASSET_CODE.XLM
      ? Asset.native()
      : new Asset(assetCode, assetIssuer);
  }

  signTransaction(keypair: Keypair, transactionXdr: string): string {
    const transaction = TransactionBuilder.fromXDR(
      transactionXdr,
      this.networkPassphrase,
    );

    transaction.sign(keypair);
    return transaction.toXDR();
  }

  addSignatures(signatures: IAddSignature[], transactionXdr: string): string {
    const transaction = TransactionBuilder.fromXDR(
      transactionXdr,
      this.networkPassphrase,
    );

    signatures.forEach(({ signature, publicKey }) => {
      transaction.addSignature(publicKey, signature);
    });

    return transaction.toXDR();
  }

  async submitTransaction(
    transactionXdr: string,
  ): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
    const transaction = TransactionBuilder.fromXDR(
      transactionXdr,
      this.networkPassphrase,
    );

    return await this.stellarServer.submitTransaction(transaction);
  }
}
