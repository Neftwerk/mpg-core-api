import { XdrResponseDto } from '@module/account/application/dto/xdr.response.dto';
import { AddSignatureRequestDto } from '@module/recovery/application/dto/add-signature-request.dto';
import { AddSignerResponseDto } from '@module/recovery/application/dto/add-signer-response.dto';
import { AuthenticateWithVerificationCodeRequestDto } from '@module/recovery/application/dto/authenticate-with-verification-code-request.dto';
import { AuthenticateWithVerificationCodeResponseDto } from '@module/recovery/application/dto/authenticate-with-verification-code-response.dto';
import { ConfigureAccountRecoveryRequestDto } from '@module/recovery/application/dto/configure-account-recovery-request.dto';
import { ConfigureAccountRecoveryResponseDto } from '@module/recovery/application/dto/configure-account-recovery-response.dto';
import { CreateSignerRequestDto } from '@module/recovery/application/dto/create-signer-request.dto';
import { GenerateRecoveryChallengeResponseDto } from '@module/recovery/application/dto/generate-recovery-challenge-response.dto';
import { GenerateRecoveryTokenDto } from '@module/recovery/application/dto/generate-recovery-token-request.dto';
import { GenerateRecoveryTokenResponseDto } from '@module/recovery/application/dto/generate-recovery-token-response.dto';
import { RecoverAccountRequestDto } from '@module/recovery/application/dto/recover-account-request.dto';
import { SendVerificationCodeResponseDto } from '@module/recovery/application/dto/send-verification-code-response.dto';
import { IServerDomainKeyValue } from '@module/recovery/application/interface/server-domain-key-value.interface';
import { RecoveryService } from '@module/recovery/application/service/recovery.service';
import { RecoveryToken } from '@module/recovery/controllers/decorator/recovery-token.decorator';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';

import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { User } from '@iam/user/domain/user.entity';

@Controller('recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Get('/auth')
  async getRecoveryChallenge(
    @CurrentUser() { masterKey }: User,
  ): Promise<OneSerializedResponseDto<GenerateRecoveryChallengeResponseDto>> {
    return await this.recoveryService.getRecoveryChallenge(masterKey);
  }

  @Post('/auth')
  @HttpCode(HttpStatus.OK)
  async generateRecoveryToken(
    @Body() generateRecoveryTokenDto: GenerateRecoveryTokenDto,
  ): Promise<OneSerializedResponseDto<GenerateRecoveryTokenResponseDto>> {
    return await this.recoveryService.getRecoveryToken(
      generateRecoveryTokenDto,
    );
  }

  @Post('/configuration')
  @HttpCode(HttpStatus.OK)
  async configureAccountRecovery(
    @CurrentUser() user: User,
    @Body()
    { deviceKey }: ConfigureAccountRecoveryRequestDto,
    @RecoveryToken() recoveryServerTokens: IServerDomainKeyValue,
  ): Promise<OneSerializedResponseDto<ConfigureAccountRecoveryResponseDto>> {
    return await this.recoveryService.configureRecovery(
      user,
      deviceKey,
      recoveryServerTokens,
    );
  }

  @Get('/external-auth/verification')
  async sendVerificationCode(
    @CurrentUser() user: User,
  ): Promise<OneSerializedResponseDto<SendVerificationCodeResponseDto>> {
    return await this.recoveryService.sendVerificationCode(user);
  }

  @Post('/external-auth/authentication')
  @HttpCode(HttpStatus.OK)
  async authenticate(
    @CurrentUser() user: User,
    @Body()
    { codes }: AuthenticateWithVerificationCodeRequestDto,
  ): Promise<
    OneSerializedResponseDto<AuthenticateWithVerificationCodeResponseDto>
  > {
    return await this.recoveryService.authenticateWithVerificationCode(
      user,
      codes,
    );
  }

  @Post('/signer')
  async createSigner(
    @CurrentUser() user: User,
    @Body() { signers }: CreateSignerRequestDto,
  ): Promise<OneSerializedResponseDto<AddSignerResponseDto>> {
    return await this.recoveryService.saveSigners(user, signers);
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  async recoverAccount(
    @CurrentUser() { masterKey }: User,
    @Body() { newDeviceKey }: RecoverAccountRequestDto,
  ): Promise<OneSerializedResponseDto<XdrResponseDto>> {
    return await this.recoveryService.recoverAccount(masterKey, newDeviceKey);
  }

  @Post('/signature')
  @HttpCode(HttpStatus.OK)
  async addSignatures(
    @CurrentUser() user: User,
    @Body() { transaction }: AddSignatureRequestDto,
    @RecoveryToken() recoveryServerTokens: IServerDomainKeyValue,
  ): Promise<OneSerializedResponseDto<XdrResponseDto>> {
    return await this.recoveryService.addSignatures(
      user,
      transaction,
      recoveryServerTokens,
    );
  }
}
