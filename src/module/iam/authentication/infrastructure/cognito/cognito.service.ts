/* istanbul ignore file */
import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ISuccessfulOperationResponse } from '@common/base/application/interface/successful-operation-response.interface';

import { IRefreshSessionResponse } from '@iam/authentication/application/dto/refresh-session-response.interface';
import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';
import { ISignUpResponse } from '@iam/authentication/application/dto/sign-up-response.interface';
import { IIdentityProviderService } from '@iam/authentication/application/service/identity-provider.service.interface';
import { CodeMismatchException } from '@iam/authentication/infrastructure/cognito/exception/code-mismatch.exception';
import {
  CODE_MISMATCH_ERROR,
  EXPIRED_CODE_ERROR,
  INVALID_PASSWORD_ERROR,
  INVALID_REFRESH_TOKEN_ERROR,
  NEW_PASSWORD_REQUIRED_ERROR,
  PASSWORD_VALIDATION_ERROR,
  USER_NOT_CONFIRMED_ERROR,
} from '@iam/authentication/infrastructure/cognito/exception/cognito-exception-messages';
import { CouldNotSignUpException } from '@iam/authentication/infrastructure/cognito/exception/could-not-sign-up.exception';
import { ExpiredCodeException } from '@iam/authentication/infrastructure/cognito/exception/expired-code.exception';
import { InvalidPasswordException } from '@iam/authentication/infrastructure/cognito/exception/invalid-password.exception';
import { InvalidRefreshTokenException } from '@iam/authentication/infrastructure/cognito/exception/invalid-refresh-token.exception';
import { NewPasswordRequiredException } from '@iam/authentication/infrastructure/cognito/exception/new-password-required.exception';
import { PasswordValidationException } from '@iam/authentication/infrastructure/cognito/exception/password-validation.exception';
import { UnexpectedErrorCodeException } from '@iam/authentication/infrastructure/cognito/exception/unexpected-code.exception';
import { UserNotConfirmedException } from '@iam/authentication/infrastructure/cognito/exception/user-not-confirmed.exception';

@Injectable()
export class CognitoService implements IIdentityProviderService {
  private readonly client: CognitoIdentityProviderClient;
  private readonly clientId: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get('cognito.clientId');
    this.client = new CognitoIdentityProviderClient({
      endpoint: this.configService.get('cognito.endpoint'),
    });
  }

  async signUp(username: string, password: string): Promise<ISignUpResponse> {
    try {
      const command = new SignUpCommand({
        ClientId: this.clientId,
        Username: username,
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: username,
          },
        ],
      });

      const result = await this.client.send(command);
      return { externalId: result.UserSub };
    } catch (error) {
      if (error.name === 'InvalidPasswordException') {
        throw new PasswordValidationException({
          message: PASSWORD_VALIDATION_ERROR,
        });
      }
      throw new CouldNotSignUpException({
        message: error.message,
      });
    }
  }

  async signIn(username: string, password: string): Promise<ISignInResponse> {
    try {
      const input: InitiateAuthCommandInput = {
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      };

      const command = new InitiateAuthCommand(input);
      const result = await this.client.send(command);

      return {
        accessToken: result.AuthenticationResult.AccessToken,
        refreshToken: result.AuthenticationResult.RefreshToken,
      };
    } catch (error) {
      switch (error.name) {
        case 'UserNotConfirmedException':
          throw new UserNotConfirmedException({
            message: USER_NOT_CONFIRMED_ERROR,
          });
        case 'InvalidPasswordException':
          throw new InvalidPasswordException({
            message: INVALID_PASSWORD_ERROR,
          });
        case 'NotAuthorizedException':
          throw new PasswordValidationException({
            message: PASSWORD_VALIDATION_ERROR,
          });
        case 'PasswordResetRequiredException':
          throw new NewPasswordRequiredException({
            message: NEW_PASSWORD_REQUIRED_ERROR,
          });
        default:
          throw new UnexpectedErrorCodeException({
            code: error.name,
          });
      }
    }
  }

  async confirmUser(
    username: string,
    code: string,
  ): Promise<ISuccessfulOperationResponse> {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: username,
        ConfirmationCode: code,
      });

      await this.client.send(command);
      return {
        success: true,
        message: 'User successfully confirmed',
      };
    } catch (error) {
      switch (error.name) {
        case 'CodeMismatchException':
          throw new CodeMismatchException({
            message: CODE_MISMATCH_ERROR,
            pointer: '/confirm-password/code',
          });
        case 'ExpiredCodeException':
          throw new ExpiredCodeException({
            message: EXPIRED_CODE_ERROR,
          });
        default:
          throw new UnexpectedErrorCodeException({
            code: error.name,
          });
      }
    }
  }

  async resendConfirmationCode(
    username: string,
  ): Promise<ISuccessfulOperationResponse> {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: this.clientId,
        Username: username,
      });

      await this.client.send(command);
      return {
        success: true,
        message: 'A new confirmation code has been sent',
      };
    } catch (error) {
      throw new UnexpectedErrorCodeException({
        code: error.name,
      });
    }
  }

  async forgotPassword(
    username: string,
  ): Promise<ISuccessfulOperationResponse> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: username,
      });

      await this.client.send(command);
      return {
        success: true,
        message: 'Password reset instructions have been sent',
      };
    } catch (error) {
      throw new UnexpectedErrorCodeException({
        code: error.name,
      });
    }
  }

  async confirmPassword(
    username: string,
    newPassword: string,
    code: string,
  ): Promise<ISuccessfulOperationResponse> {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.clientId,
        Username: username,
        Password: newPassword,
        ConfirmationCode: code,
      });

      await this.client.send(command);
      return {
        success: true,
        message: 'Your password has been correctly updated',
      };
    } catch (error) {
      switch (error.name) {
        case 'CodeMismatchException':
          throw new CodeMismatchException({
            message: CODE_MISMATCH_ERROR,
            pointer: '/confirm-password/code',
          });
        case 'ExpiredCodeException':
          throw new ExpiredCodeException({
            message: EXPIRED_CODE_ERROR,
            pointer: '/confirm-password/code',
          });
        case 'InvalidPasswordException':
          throw new PasswordValidationException({
            message: PASSWORD_VALIDATION_ERROR,
            pointer: '/confirm-password/new-password',
          });
        default:
          throw new UnexpectedErrorCodeException({
            code: error.name,
          });
      }
    }
  }

  async refreshSession(
    _username: string,
    refreshToken: string,
  ): Promise<IRefreshSessionResponse> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        ClientId: this.clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      });

      const result = await this.client.send(command);
      return {
        accessToken: result.AuthenticationResult.AccessToken,
      };
    } catch (error) {
      if (error.name === 'NotAuthorizedException') {
        throw new InvalidRefreshTokenException({
          message: INVALID_REFRESH_TOKEN_ERROR,
        });
      }
      throw new UnexpectedErrorCodeException({
        code: error.name,
      });
    }
  }
}
