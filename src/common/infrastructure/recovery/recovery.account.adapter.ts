import { IDENTITY_ROLE } from '@module/recovery/application/enum/auth-identity-role.enum';
import { AUTH_METHOD_TYPE } from '@module/recovery/application/enum/auth-method-type.enum';
import { IIdentity } from '@module/recovery/application/interface/identity.interface';
import { IRegisteredAccountResponse } from '@module/recovery/application/interface/registered-sccount-response.interface';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import {
  AuthenticateWithExternalAuthCodeException,
  InvalidValidationCodeMethodException,
  TooManyValidationAttemptsException,
  ValidationCodeExpiredException,
} from '@common/infrastructure/recovery/exception/authenticate-with-external-code.exception';
import { NODE_EXCEPTION_MESSAGES } from '@common/infrastructure/recovery/exception/exception.messages.enum';
import {
  GenerateChallengeException,
  InvalidSourceAddressException,
} from '@common/infrastructure/recovery/exception/generate-challenge.exception';
import { GenerateSignatureException } from '@common/infrastructure/recovery/exception/generate-signature.exception';
import { GenerateTokenException } from '@common/infrastructure/recovery/exception/generate-token.exception';
import {
  InvalidFieldException,
  RegisterAccountException,
  UserAlreadyExistsException,
  UserNotFoundException,
} from '@common/infrastructure/recovery/exception/register-account.exception';
import { SendVerificationCodeException } from '@common/infrastructure/recovery/exception/send-external-auth-code.exception';
import { IRecoveryNode } from '@common/infrastructure/recovery/interface/IRecoveryNode.interface';

@Injectable()
export abstract class AbstractRecoveryNode implements IRecoveryNode {
  protected abstract getAuthNode(): string;

  constructor(protected readonly httpService: HttpService) {}

  async getNodeDomain(): Promise<string> {
    const url = this.getAuthNode();

    return new URL(url).hostname;
  }

  async getSep10Challenge(account: string): Promise<string> {
    try {
      const url = `${this.getAuthNode()}/auth?account=${account}`;

      const { data } = await this.httpService.axiosRef.get(url);

      return data.transaction;
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.error;

        if (errorMessage === NODE_EXCEPTION_MESSAGES.INVALID_SOURCE_ADDRESS) {
          throw new InvalidSourceAddressException();
        }
      }
      throw new GenerateChallengeException();
    }
  }

  async getSep10Token(transaction: string): Promise<string> {
    try {
      const url = `${this.getAuthNode()}/auth`;
      const body = {
        transaction,
      };

      const { data } = await this.httpService.axiosRef.post(url, body);

      return data.token;
    } catch (error) {
      throw new GenerateTokenException();
    }
  }

  private identityGenerator(email: string): IIdentity[] {
    return [
      {
        role: IDENTITY_ROLE.OWNER,
        auth_methods: [
          {
            type: AUTH_METHOD_TYPE.EMAIL,
            value: email,
          },
        ],
      },
    ];
  }

  async registerAccount(
    account: string,
    token: string,
    email: string,
  ): Promise<IRegisteredAccountResponse> {
    try {
      const accountToRegister = {
        identities: this.identityGenerator(email),
      };

      const url = `${this.getAuthNode()}/accounts/${account}`;

      const { data } = await this.httpService.axiosRef.post(
        url,
        accountToRegister,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return data;
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.error;

        if (errorMessage === NODE_EXCEPTION_MESSAGES.INVALID_FIELD) {
          throw new InvalidFieldException();
        }

        if (errorMessage === NODE_EXCEPTION_MESSAGES.USER_NOT_FOUND) {
          throw new UserNotFoundException();
        }

        if (errorMessage === NODE_EXCEPTION_MESSAGES.USER_ALREADY_EXISTS) {
          throw new UserAlreadyExistsException();
        }
      }
      throw new RegisterAccountException();
    }
  }

  async sendExternalAuthCode(address: string, value: string): Promise<void> {
    try {
      const url = `${this.getAuthNode()}/external-auth/verification/${address}`;
      const body = { type: AUTH_METHOD_TYPE.EMAIL, value };

      await this.httpService.axiosRef.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.error;

        if (errorMessage === NODE_EXCEPTION_MESSAGES.INVALID_METHOD) {
          throw new InvalidValidationCodeMethodException();
        }
      }
      throw new SendVerificationCodeException();
    }
  }

  async authenticateWithExternalAuthCode(
    address: string,
    value: string,
    code: string,
  ): Promise<string> {
    try {
      const url = `${this.getAuthNode()}/external-auth/authentication/${address}`;
      const body = {
        type: AUTH_METHOD_TYPE.EMAIL,
        value,
        verificationCode: code,
      };

      const {
        data: { token },
      } = await this.httpService.axiosRef.post<{ token: string }>(url, body, {
        headers: { 'Content-Type': 'application/json' },
      });

      return token;
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.error;

        if (errorMessage === NODE_EXCEPTION_MESSAGES.VALIDATION_CODE_EXPIRED) {
          throw new ValidationCodeExpiredException();
        }

        if (errorMessage === NODE_EXCEPTION_MESSAGES.INVALID_METHOD) {
          throw new InvalidValidationCodeMethodException();
        }

        if (errorMessage === NODE_EXCEPTION_MESSAGES.TOO_MANY_REQUESTS) {
          throw new TooManyValidationAttemptsException();
        }
      }

      throw new AuthenticateWithExternalAuthCodeException();
    }
  }

  async generateSignature(
    address: string,
    signingAddress: string,
    transaction: string,
    token: string,
  ): Promise<string> {
    try {
      const url = `${this.getAuthNode()}/accounts/${address}/sign/${signingAddress}`;

      const body = { transaction };

      const { data } = await this.httpService.axiosRef.post(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return data.signature;
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.error;

        if (errorMessage === NODE_EXCEPTION_MESSAGES.USER_NOT_FOUND) {
          throw new UserNotFoundException();
        }
      }
      throw new GenerateSignatureException();
    }
  }
}
