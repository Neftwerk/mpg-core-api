import { XdrResponseDto } from '@module/account/application/dto/xdr.response.dto';
import { AccountService } from '@module/account/application/service/account.service';
import { ACCOUNT_SERVICE } from '@module/account/domain/account-service.constant';
import { RecoveryResponseAdapter } from '@module/recovery/application/adapter/recovery-response.adapter';
import { AddSignerResponseDto } from '@module/recovery/application/dto/add-signer-response.dto';
import { AuthenticateWithVerificationCodeResponseDto } from '@module/recovery/application/dto/authenticate-with-verification-code-response.dto';
import { ConfigureAccountRecoveryResponseDto } from '@module/recovery/application/dto/configure-account-recovery-response.dto';
import { GenerateRecoveryChallengeResponseDto } from '@module/recovery/application/dto/generate-recovery-challenge-response.dto';
import { GenerateRecoveryTokenDto } from '@module/recovery/application/dto/generate-recovery-token-request.dto';
import { GenerateRecoveryTokenResponseDto } from '@module/recovery/application/dto/generate-recovery-token-response.dto';
import { SendVerificationCodeResponseDto } from '@module/recovery/application/dto/send-verification-code-response.dto';
import { ACCOUNT_WEIGHT } from '@module/recovery/application/enum/account-weight.enum';
import { AUTH_METHOD_TYPE } from '@module/recovery/application/enum/auth-method-type.enum';
import { RecoveryResponseType } from '@module/recovery/application/enum/signer.response.type.enum';
import { IRecoveryService } from '@module/recovery/application/interface/recovery-service.interface';
import { IServerDomainKeyValue } from '@module/recovery/application/interface/server-domain-key-value.interface';
import { RecoveryOperationService } from '@module/recovery/application/service/recovery.operation.service';
import { Sep10AuthService } from '@module/recovery/application/service/sep10AuthService';
import { ACCOUNT_RECOVERY_NODES } from '@module/recovery/domain/account-recovery-node.constant';
import { Signer } from '@module/recovery/domain/signer.entity';
import { RECOVERY_REPOSITORY } from '@module/recovery/infrastructure/database/recovery.postgresql.repository';
import { IRecoveryRepository } from '@module/recovery/repository/recovery.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { IRecoveryNode } from '@common/infrastructure/recovery/interface/IRecoveryNode.interface';
import { IAddSignature } from '@common/infrastructure/stellar/interface/add-signature.interface';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar.transaction.adapter';

import { IUser } from '@iam/authorization/application/interfaces/user.interface';

import { ACCOUNT_TYPE } from '../enum/account-type.enum';
import { InvalidPublicKeyException } from '../exception/invalid-public-key.exception';
import { SignerResponseMapper } from '../mapper/signer.response.mapper';

@Injectable()
export class RecoveryService implements IRecoveryService {
  constructor(
    private readonly stellarTransactionAdapter: StellarTransactionAdapter,
    private readonly sep10AuthService: Sep10AuthService,
    private readonly recoveryOperationService: RecoveryOperationService,
    private readonly recoveryResponseAdapter: RecoveryResponseAdapter,
    private readonly signerResponseMapper: SignerResponseMapper,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountService,
    @Inject(ACCOUNT_RECOVERY_NODES)
    private readonly recoveryNodes: IRecoveryNode[],
    @Inject(RECOVERY_REPOSITORY)
    private readonly recoveryRepository: IRecoveryRepository,
  ) {}

  async getRecoveryChallenge(
    publicKey: string,
  ): Promise<OneSerializedResponseDto<GenerateRecoveryChallengeResponseDto>> {
    if (!publicKey) {
      throw new InvalidPublicKeyException();
    }
    const challenges =
      await this.sep10AuthService.generateSep10Challenge(publicKey);

    return this.recoveryResponseAdapter.oneEntityResponseRecovery<GenerateRecoveryChallengeResponseDto>(
      RecoveryResponseType.RECOVERY_CHALLENGE,
      { challenges },
    );
  }

  async getRecoveryToken({
    signedChallenges,
  }: GenerateRecoveryTokenDto): Promise<
    OneSerializedResponseDto<GenerateRecoveryTokenResponseDto>
  > {
    const tokens =
      await this.sep10AuthService.generateSep10Token(signedChallenges);

    return this.recoveryResponseAdapter.oneEntityResponseRecovery<GenerateRecoveryTokenResponseDto>(
      RecoveryResponseType.RECOVERY_TOKEN,
      { tokens },
    );
  }

  async configureRecovery(
    user: IUser,
    deviceKey: string,
    tokens: IServerDomainKeyValue,
  ): Promise<OneSerializedResponseDto<ConfigureAccountRecoveryResponseDto>> {
    const { masterKey, username: email } = user;

    const signers = await this.registerAccounts(masterKey, tokens, email);

    const setWeightsOperation =
      this.recoveryOperationService.setAccountWeights();

    const addDeviceKeyOperation = this.recoveryOperationService.addSigner(
      deviceKey,
      ACCOUNT_TYPE.DEVICE,
    );

    const addSignerOperations = Object.keys(signers).map((serverUrl) =>
      this.recoveryOperationService.addSigner(
        signers[serverUrl],
        ACCOUNT_TYPE.SERVER,
      ),
    );

    const transaction = await this.stellarTransactionAdapter.buildTransaction(
      masterKey,
      [setWeightsOperation, addDeviceKeyOperation, ...addSignerOperations],
    );

    return this.recoveryResponseAdapter.oneEntityResponseRecovery<ConfigureAccountRecoveryResponseDto>(
      RecoveryResponseType.CONFIGURE_RECOVERY,
      { xdr: transaction, signers },
    );
  }

  async saveSigners(
    user: IUser,
    signers: IServerDomainKeyValue,
  ): Promise<OneSerializedResponseDto<AddSignerResponseDto>> {
    const savedSigners = await Promise.all(
      Object.entries(signers).map(([domain, publicKey]) => {
        return this.recoveryRepository.saveOne(
          new Signer(publicKey, domain, user),
        );
      }),
    );

    const signerResponse =
      this.signerResponseMapper.toSignerResponse(savedSigners);

    return this.recoveryResponseAdapter.oneEntityResponseRecovery<AddSignerResponseDto>(
      RecoveryResponseType.ADD_SIGNERS,
      signerResponse,
    );
  }

  async sendVerificationCode(
    user: IUser,
  ): Promise<OneSerializedResponseDto<SendVerificationCodeResponseDto>> {
    const { masterKey, username: email } = user;

    const servers = {};

    for (const node of this.recoveryNodes) {
      const domain = await node.getNodeDomain();
      await node.sendExternalAuthCode(masterKey, email);
      servers[domain] = AUTH_METHOD_TYPE.EMAIL;
    }

    return this.recoveryResponseAdapter.oneEntityResponseRecovery<SendVerificationCodeResponseDto>(
      RecoveryResponseType.SEND_VERIFICATION_CODE,
      { servers },
    );
  }

  async authenticateWithVerificationCode(
    user: IUser,
    codes: IServerDomainKeyValue,
  ): Promise<
    OneSerializedResponseDto<AuthenticateWithVerificationCodeResponseDto>
  > {
    const { masterKey, username: email } = user;

    const externalAuthTokens = await Promise.all(
      this.recoveryNodes.map(async (node) => {
        const domain = await node.getNodeDomain();
        const code = codes[domain];

        const token = await node.authenticateWithExternalAuthCode(
          masterKey,
          email,
          code,
        );
        return { [domain]: token };
      }),
    );

    return this.recoveryResponseAdapter.oneEntityResponseRecovery<AuthenticateWithVerificationCodeResponseDto>(
      RecoveryResponseType.AUTHENTICATE_WITH_VERIFICATION_CODE,
      { externalAuthTokens: Object.assign({}, ...externalAuthTokens) },
    );
  }

  private async registerAccounts(
    masterKey: string,
    tokens: IServerDomainKeyValue,
    email: string,
  ): Promise<IServerDomainKeyValue> {
    const accounts = await Promise.all(
      this.recoveryNodes.map(async (node) => {
        const domain = await node.getNodeDomain();
        const token = tokens[domain];

        const account = await node.registerAccount(masterKey, token, email);

        return { [domain]: account.signers[0].key };
      }),
    );
    return Object.assign({}, ...accounts);
  }

  async recoverAccount(
    masterKey: string,
    newDeviceKey: string,
  ): Promise<OneSerializedResponseDto<XdrResponseDto>> {
    const oldDeviceKey = await this.accountService.getDeviceKeyFromAccount(
      masterKey,
      ACCOUNT_WEIGHT.MAX,
    );

    const removeOldDeviceKeyOperation = this.recoveryOperationService.addSigner(
      oldDeviceKey,
      ACCOUNT_TYPE.UNUSED,
    );

    const addNewDeviceKeyOperation = this.recoveryOperationService.addSigner(
      newDeviceKey,
      ACCOUNT_TYPE.DEVICE,
    );
    const transaction = await this.stellarTransactionAdapter.buildTransaction(
      masterKey,
      [removeOldDeviceKeyOperation, addNewDeviceKeyOperation],
    );

    return this.recoveryResponseAdapter.oneEntityResponseRecovery<XdrResponseDto>(
      RecoveryResponseType.RECOVER_ACCOUNT,
      { xdr: transaction },
    );
  }

  async addSignatures(
    { masterKey, externalId }: IUser,
    transaction: string,
    tokens: IServerDomainKeyValue,
  ): Promise<OneSerializedResponseDto<XdrResponseDto>> {
    const signingAddresses = await this.getSigningAddresses(externalId);

    const signatures: IAddSignature[] = await Promise.all(
      this.recoveryNodes.map(async (node) => {
        const domain = await node.getNodeDomain();

        const token = tokens[domain];

        const signingAddress = signingAddresses[domain];

        const signature = await node.generateSignature(
          masterKey,
          signingAddress,
          transaction,
          token,
        );

        return { publicKey: signingAddress, signature };
      }),
    );

    const signedTransaction = this.stellarTransactionAdapter.addSignatures(
      signatures,
      transaction,
    );

    return this.recoveryResponseAdapter.oneEntityResponseRecovery<XdrResponseDto>(
      RecoveryResponseType.ADD_SIGNATURES,
      { xdr: signedTransaction },
    );
  }

  private async getSigningAddresses(
    externalId: string,
  ): Promise<IServerDomainKeyValue> {
    const signers =
      await this.recoveryRepository.getByUserExternalId(externalId);

    return Object.assign(
      {},
      ...signers.map((signer) => ({ [signer.domain]: signer.publicKey })),
    );
  }
}
