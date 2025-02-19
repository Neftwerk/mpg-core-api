import { ForbiddenException, Inject, Injectable } from '@nestjs/common';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { ISuccessfulOperationResponse } from '@common/base/application/interface/successful-operation-response.interface';

import { AdminResponseDto } from '@iam/admin/application/dto/admin-response.dto';
import { AdminMapper } from '@iam/admin/application/mapper/admin.mapper';
import {
  ADMIN_REPOSITORY_KEY,
  IAdminRepository,
} from '@iam/admin/application/repository/admin.repository.interface';
import { ADMIN_ENTITY_NAME } from '@iam/admin/domain/admin.name';
import { AuthenticationResponseAdapter } from '@iam/authentication/application/adapter/authentication-response.adapter';
import { IConfirmPasswordDto } from '@iam/authentication/application/dto/confirm-password.dto.interface';
import { IConfirmUserDto } from '@iam/authentication/application/dto/confirm-user.dto.interface';
import { IForgotPasswordDto } from '@iam/authentication/application/dto/forgot-password.dto.interface';
import { IRefreshSessionResponse } from '@iam/authentication/application/dto/refresh-session-response.interface';
import { IRefreshSessionDto } from '@iam/authentication/application/dto/refresh-session.dto.interface';
import { IResendConfirmationCodeDto } from '@iam/authentication/application/dto/resend-confirmation-code.dto.interface';
import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';
import { ISignInDto } from '@iam/authentication/application/dto/sign-in.dto.interface';
import { ISignUpDto } from '@iam/authentication/application/dto/sign-up.dto.interface';
import {
  USER_ALREADY_CONFIRMED_ERROR,
  USER_ALREADY_SIGNED_UP_ERROR,
} from '@iam/authentication/application/exception/authentication-exception-messages';
import { UserAlreadyConfirmed } from '@iam/authentication/application/exception/user-already-confirmed.exception';
import { UserAlreadySignedUp } from '@iam/authentication/application/exception/user-already-signed-up.exception';
import {
  IDENTITY_PROVIDER_SERVICE_KEY,
  IIdentityProviderService,
} from '@iam/authentication/application/service/identity-provider.service.interface';
import { AUTHENTICATION_NAME } from '@iam/authentication/domain/authtentication.name';
import { AppRole } from '@iam/authorization/domain/app-role.enum';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { UserMapper } from '@iam/user/application/mapper/user.mapper';
import {
  IUserRepository,
  USER_REPOSITORY_KEY,
} from '@iam/user/application/repository/user.repository.interface';
import { User } from '@iam/user/domain/user.entity';
import { USER_ENTITY_NAME } from '@iam/user/domain/user.name';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(IDENTITY_PROVIDER_SERVICE_KEY)
    private readonly identityProviderService: IIdentityProviderService,
    @Inject(USER_REPOSITORY_KEY)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
    @Inject(ADMIN_REPOSITORY_KEY)
    private readonly adminRepository: IAdminRepository,
    private readonly adminMapper: AdminMapper,
    private readonly authenticationResponseAdapter: AuthenticationResponseAdapter,
  ) {}

  async handleSignUp(
    signUpDto: ISignUpDto,
  ): Promise<OneSerializedResponseDto<UserResponseDto>> {
    const { username, password } = signUpDto;

    const existingUser = await this.userRepository.getOneByUsername(username);

    if (!existingUser) {
      return this.signUpAndSave(username, password);
    }

    if (!existingUser.externalId) {
      return this.signUpAndSave(username, password, existingUser.id);
    }

    throw new UserAlreadySignedUp({
      message: USER_ALREADY_SIGNED_UP_ERROR,
      pointer: '/user/externalId',
    });
  }

  async handleAdminSignUp(
    signUpDto: ISignUpDto,
  ): Promise<OneSerializedResponseDto<AdminResponseDto>> {
    const { username, password } = signUpDto;

    const existingUser =
      await this.adminRepository.getOneByAdminUsername(username);
    const userCount = await this.adminRepository.countUsers();
    if (!existingUser && userCount === 0) {
      return this.signUpAdminAndSave(username, password);
    } else if (existingUser && !existingUser.externalId && userCount === 1) {
      return this.signUpAdminAndSave(username, password, existingUser.id);
    } else {
      throw new ForbiddenException(
        "Sign-up disabled: 'user' table is not empty",
      );
    }
  }

  private async signUpAndSave(
    username: string,
    password: string,
    userId?: number,
  ): Promise<OneSerializedResponseDto<UserResponseDto>> {
    let userToSaveId = userId;

    if (!userToSaveId) {
      userToSaveId = (
        await this.userRepository.saveOne(new User(username, [AppRole.Regular]))
      ).id;
    }

    const { externalId } = await this.identityProviderService.signUp(
      username,
      password,
    );

    const user = await this.userRepository.updateOneOrFail(userToSaveId, {
      externalId,
    });

    return this.authenticationResponseAdapter.oneEntityResponseAuth<UserResponseDto>(
      USER_ENTITY_NAME,
      this.userMapper.fromUserToUserResponseDto(user),
    );
  }

  private async signUpAdminAndSave(
    username: string,
    password: string,
    userId?: number,
  ): Promise<OneSerializedResponseDto<UserResponseDto>> {
    let userToSaveId = userId;

    if (!userToSaveId) {
      userToSaveId = (
        await this.adminRepository.saveOne(new User(username, [AppRole.Admin]))
      ).id;
    }

    const { externalId } = await this.identityProviderService.signUp(
      username,
      password,
    );

    const adminUser = await this.adminRepository.updateOneOrFail(userToSaveId, {
      externalId,
    });

    return this.authenticationResponseAdapter.oneEntityResponseAuth<UserResponseDto>(
      ADMIN_ENTITY_NAME,
      this.adminMapper.fromAdminToAdminResponseDto(adminUser),
    );
  }

  async handleSignIn(
    signInDto: ISignInDto,
  ): Promise<OneSerializedResponseDto<ISignInResponse>> {
    const { username, password } = signInDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);

    const response = await this.identityProviderService.signIn(
      existingUser.username,
      password,
    );

    return this.authenticationResponseAdapter.oneEntityResponseAuth<ISignInResponse>(
      AUTHENTICATION_NAME,
      response,
    );
  }

  async handleAdminSignIn(
    signInDto: ISignInDto,
  ): Promise<OneSerializedResponseDto<ISignInResponse>> {
    const { username, password } = signInDto;
    const existingUser =
      await this.adminRepository.getOneByAdminUsernameOrFail(username);

    const response = await this.identityProviderService.signIn(
      existingUser.username,
      password,
    );

    return this.authenticationResponseAdapter.oneEntityResponseAuth<ISignInResponse>(
      AUTHENTICATION_NAME,
      response,
    );
  }

  async handleConfirmUser(
    confirmUserDto: IConfirmUserDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    const { username, code } = confirmUserDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);

    if (existingUser.isVerified) {
      throw new UserAlreadyConfirmed({
        message: USER_ALREADY_CONFIRMED_ERROR,
        pointer: '/user/isVerified',
      });
    }

    const confirmUserResponse = await this.identityProviderService.confirmUser(
      existingUser.username,
      code,
    );

    await this.userRepository.updateOneOrFail(existingUser.id, {
      isVerified: true,
    });

    return this.authenticationResponseAdapter.oneEntityResponseAuth<ISuccessfulOperationResponse>(
      AUTHENTICATION_NAME,
      confirmUserResponse,
    );
  }
  async handleConfirmAdminUser(
    confirmAdminUserDto: IConfirmUserDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    const { username, code } = confirmAdminUserDto;
    const existingAdminUser =
      await this.adminRepository.getOneByAdminUsernameOrFail(username);

    if (existingAdminUser.isVerified) {
      throw new UserAlreadyConfirmed({
        message: USER_ALREADY_CONFIRMED_ERROR,
        pointer: '/user/isVerified',
      });
    }

    const confirmAdminUserResponse =
      await this.identityProviderService.confirmUser(
        existingAdminUser.username,
        code,
      );

    await this.userRepository.updateOneOrFail(existingAdminUser.id, {
      isVerified: true,
    });

    return this.authenticationResponseAdapter.oneEntityResponseAuth<ISuccessfulOperationResponse>(
      AUTHENTICATION_NAME,
      confirmAdminUserResponse,
    );
  }

  async handleForgotPassword(
    forgotPasswordDto: IForgotPasswordDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    const { username } = forgotPasswordDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);

    const response = await this.identityProviderService.forgotPassword(
      existingUser.username,
    );

    return this.authenticationResponseAdapter.oneEntityResponseAuth<ISuccessfulOperationResponse>(
      AUTHENTICATION_NAME,
      response,
    );
  }

  async handleForgotAdminPassword(
    forgotPasswordDto: IForgotPasswordDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    const { username } = forgotPasswordDto;
    const existingUser =
      await this.adminRepository.getOneByAdminUsernameOrFail(username);

    const response = await this.identityProviderService.forgotPassword(
      existingUser.username,
    );

    return this.authenticationResponseAdapter.oneEntityResponseAuth<ISuccessfulOperationResponse>(
      AUTHENTICATION_NAME,
      response,
    );
  }

  async handleConfirmPassword(
    confirmPasswordDto: IConfirmPasswordDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    const { username, newPassword, code } = confirmPasswordDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);

    const response = await this.identityProviderService.confirmPassword(
      existingUser.username,
      newPassword,
      code,
    );

    return this.authenticationResponseAdapter.oneEntityResponseAuth<ISuccessfulOperationResponse>(
      AUTHENTICATION_NAME,
      response,
    );
  }

  async handleConfirmAdminPassword(
    confirmPasswordDto: IConfirmPasswordDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    const { username, newPassword, code } = confirmPasswordDto;
    const existingUser =
      await this.adminRepository.getOneByAdminUsernameOrFail(username);

    const response = await this.identityProviderService.confirmPassword(
      existingUser.username,
      newPassword,
      code,
    );

    return this.authenticationResponseAdapter.oneEntityResponseAuth<ISuccessfulOperationResponse>(
      AUTHENTICATION_NAME,
      response,
    );
  }

  async handleResendConfirmationCode(
    resendConfirmationCodeDto: IResendConfirmationCodeDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    const { username } = resendConfirmationCodeDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);

    const response = await this.identityProviderService.resendConfirmationCode(
      existingUser.username,
    );

    return this.authenticationResponseAdapter.oneEntityResponseAuth<ISuccessfulOperationResponse>(
      AUTHENTICATION_NAME,
      response,
    );
  }

  async handleResendAdminConfirmationCode(
    resendConfirmationCodeDto: IResendConfirmationCodeDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    const { username } = resendConfirmationCodeDto;
    const existingUser =
      await this.adminRepository.getOneByAdminUsernameOrFail(username);

    const response = await this.identityProviderService.resendConfirmationCode(
      existingUser.username,
    );

    return this.authenticationResponseAdapter.oneEntityResponseAuth<ISuccessfulOperationResponse>(
      AUTHENTICATION_NAME,
      response,
    );
  }

  async handleRefreshSession(
    refreshSessionDto: IRefreshSessionDto,
  ): Promise<OneSerializedResponseDto<IRefreshSessionResponse>> {
    const { username, refreshToken } = refreshSessionDto;
    const existingUser =
      await this.userRepository.getOneByUsernameOrFail(username);

    const response = await this.identityProviderService.refreshSession(
      existingUser.username,
      refreshToken,
    );

    return this.authenticationResponseAdapter.oneEntityResponseAuth<IRefreshSessionResponse>(
      AUTHENTICATION_NAME,
      response,
    );
  }

  async handleRefreshAdminSession(
    refreshSessionDto: IRefreshSessionDto,
  ): Promise<OneSerializedResponseDto<IRefreshSessionResponse>> {
    const { username, refreshToken } = refreshSessionDto;
    const existingUser =
      await this.adminRepository.getOneByAdminUsernameOrFail(username);

    const response = await this.identityProviderService.refreshSession(
      existingUser.username,
      refreshToken,
    );

    return this.authenticationResponseAdapter.oneEntityResponseAuth<IRefreshSessionResponse>(
      AUTHENTICATION_NAME,
      response,
    );
  }
}
