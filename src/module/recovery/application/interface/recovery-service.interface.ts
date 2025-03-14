import { XdrResponseDto } from '@module/account/application/dto/xdr.response.dto';
import { AddSignerResponseDto } from '@module/recovery/application/dto/add-signer-response.dto';
import { AuthenticateWithVerificationCodeResponseDto } from '@module/recovery/application/dto/authenticate-with-verification-code-response.dto';
import { ConfigureAccountRecoveryResponseDto } from '@module/recovery/application/dto/configure-account-recovery-response.dto';
import { GenerateRecoveryChallengeResponseDto } from '@module/recovery/application/dto/generate-recovery-challenge-response.dto';
import { GenerateRecoveryTokenDto } from '@module/recovery/application/dto/generate-recovery-token-request.dto';
import { GenerateRecoveryTokenResponseDto } from '@module/recovery/application/dto/generate-recovery-token-response.dto';
import { SendVerificationCodeResponseDto } from '@module/recovery/application/dto/send-verification-code-response.dto';
import { IServerDomainKeyValue } from '@module/recovery/application/interface/server-domain-key-value.interface';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';

import { IUser } from '@iam/authorization/application/interfaces/user.interface';

export interface IRecoveryService {
  getRecoveryChallenge(
    publicKey: string,
  ): Promise<OneSerializedResponseDto<GenerateRecoveryChallengeResponseDto>>;

  getRecoveryToken(
    generateRecoveryTokenDto: GenerateRecoveryTokenDto,
  ): Promise<OneSerializedResponseDto<GenerateRecoveryTokenResponseDto>>;

  configureRecovery(
    user: IUser,
    deviceKey: string,
    tokens: IServerDomainKeyValue,
  ): Promise<OneSerializedResponseDto<ConfigureAccountRecoveryResponseDto>>;

  sendVerificationCode(
    user: IUser,
  ): Promise<OneSerializedResponseDto<SendVerificationCodeResponseDto>>;

  authenticateWithVerificationCode(
    user: IUser,
    codes: IServerDomainKeyValue,
  ): Promise<
    OneSerializedResponseDto<AuthenticateWithVerificationCodeResponseDto>
  >;
  saveSigners(
    user: IUser,
    signers: IServerDomainKeyValue,
  ): Promise<OneSerializedResponseDto<AddSignerResponseDto>>;
  recoverAccount(
    masterKey: string,
    oldDeviceKey: string,
    newDeviceKey: string,
  ): Promise<OneSerializedResponseDto<XdrResponseDto>>;
  addSignatures(
    user: IUser,
    transaction: string,
    tokens: IServerDomainKeyValue,
  ): Promise<OneSerializedResponseDto<XdrResponseDto>>;
}
