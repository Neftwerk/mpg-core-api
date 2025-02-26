import {
  HttpStatus,
  INestApplication,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { UnknownErrorException } from '@common/base/infrastructure/database/exception/unknown-error.exception';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { IConfirmPasswordDto } from '@iam/authentication/application/dto/confirm-password.dto.interface';
import { IConfirmUserDto } from '@iam/authentication/application/dto/confirm-user.dto.interface';
import { IForgotPasswordDto } from '@iam/authentication/application/dto/forgot-password.dto.interface';
import { IRefreshSessionResponse } from '@iam/authentication/application/dto/refresh-session-response.interface';
import { IRefreshSessionDto } from '@iam/authentication/application/dto/refresh-session.dto.interface';
import { IResendConfirmationCodeDto } from '@iam/authentication/application/dto/resend-confirmation-code.dto.interface';
import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';
import { ISignInDto } from '@iam/authentication/application/dto/sign-in.dto.interface';
import { SignUpDto } from '@iam/authentication/application/dto/sign-up.dto';
import { ISignUpDto } from '@iam/authentication/application/dto/sign-up.dto.interface';
import {
  TOKEN_EXPIRED_ERROR,
  USER_ALREADY_CONFIRMED_ERROR,
  USER_ALREADY_SIGNED_UP_ERROR,
} from '@iam/authentication/application/exception/authentication-exception-messages';
import { TokenExpiredException } from '@iam/authentication/application/exception/token-expired.exception';
import { UserAlreadyConfirmed } from '@iam/authentication/application/exception/user-already-confirmed.exception';
import { AUTHENTICATION_NAME } from '@iam/authentication/domain/authentication.name';
import { CodeMismatchException } from '@iam/authentication/infrastructure/auth0/exception/code-mismatch.exception';
import { UsernameNotFoundException } from '@iam/user/infrastructure/database/exception/username-not-found.exception';

import {
  identityProviderServiceMock,
  testModuleBootstrapper,
} from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

describe('Authentication Module', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AUTH_ALLOWED_EMAIL_DOMAINS = 'test.com,example.com,account.com';
    await loadFixtures(`${__dirname}/fixture`, datasourceOptions);
    const moduleRef = await testModuleBootstrapper();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    delete process.env.AUTH_ALLOWED_EMAIL_DOMAINS;
    await app.close();
  });

  describe('Guards', () => {
    describe('Access Token', () => {
      it('should allow requests that contain a valid token', async () => {
        const accessToken = createAccessToken({
          sub: '00000000-0000-0000-0000-00000000000X',
        });

        await request(app.getHttpServer())
          .get('/api/v1/user')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);
      });

      it('should deny requests that contain an invalid token', async () => {
        const accessToken = createAccessToken({
          sub: 'non-existent-user-id',
        });

        await request(app.getHttpServer())
          .get('/api/v1/user')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);
      });
      it('should respond with an exception if the access token is expired', async () => {
        const expiration = '0ms';
        const accessToken = createAccessToken(
          {
            sub: '00000000-0000-0000-0000-00000000000X',
          },
          { expiresIn: expiration },
        );

        await request(app.getHttpServer())
          .get('/api/v1/user')
          .auth(accessToken, { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(
              new TokenExpiredException(TOKEN_EXPIRED_ERROR).message,
            );
          });
      });
    });
  });

  describe('API', () => {
    describe('POST - /auth/sign-up', () => {
      it('should allow users to sign up', async () => {
        const externalId = '00000000-0000-0000-0000-000000000001';
        identityProviderServiceMock.signUp.mockResolvedValueOnce({
          externalId,
        });

        const signUpDto = {
          username: 'john.doe@test.com',
          password: '$Test123',
          name: 'John',
          surname: 'Doe',
        } as SignUpDto;

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  username: signUpDto.username,
                  externalId,
                }),
              }),
            });
            expect(body).toEqual(expectedResponse);
          });
      });

      it('should allow users to retry their sign up if the external provider failed', async () => {
        identityProviderServiceMock.signUp.mockRejectedValueOnce(
          new UnknownErrorException({
            message: 'Could not sign up',
          }),
        );

        const signUpDto = {
          username: 'jane.doe@test.com',
          password: '$Test123',
          name: 'Jane',
          surname: 'Doe',
        } as SignUpDto;

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR);

        const externalId = '00000000-0000-0000-0000-000000000002';
        identityProviderServiceMock.signUp.mockResolvedValueOnce({
          externalId,
        });

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  username: signUpDto.username,
                  externalId,
                }),
              }),
            });
            expect(body).toEqual(expectedResponse);
          });
      });

      it('should throw an error if user already signed up', async () => {
        const externalId = '00000000-0000-0000-0000-000000000003';
        identityProviderServiceMock.signUp.mockResolvedValueOnce({
          externalId,
        });

        const signUpDto = {
          username: 'thomas.doe@test.com',
          password: '$Test123',
          name: 'Thomas',
          surname: 'Doe',
        } as SignUpDto;

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  username: signUpDto.username,
                  externalId,
                }),
              }),
            });
            expect(body).toEqual(expectedResponse);
          });

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body.error.detail).toBe(USER_ALREADY_SIGNED_UP_ERROR);
            expect(body.error.source.pointer).toBe('/user/externalId');
          });
      });

      it('Should throw an error if password is invalid', async () => {
        const error = new UnknownErrorException({
          message: 'Unknown error when signing up',
        });
        identityProviderServiceMock.signUp.mockRejectedValueOnce(error);
        const signUpDto: ISignUpDto = {
          username: 'some@account.com',
          password: '123456',
          name: 'Some',
          surname: 'User',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('should throw error when email domain is not allowed', async () => {
        const invalidDomainEmail = 'test@invalid-domain.com';
        const allowedDomains =
          process.env.AUTH_ALLOWED_EMAIL_DOMAINS.split(',');

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send({
            username: invalidDomainEmail,
            password: 'ValidPass123!',
          })
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.error.detail).toBe(
              `Email domain not allowed. Allowed domains are: ${allowedDomains.join(
                ', ',
              )}`,
            );
          });
      });

      it('should throw error when email has no domain', async () => {
        const invalidEmail = 'test@';
        const allowedDomains =
          process.env.AUTH_ALLOWED_EMAIL_DOMAINS.split(',');

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-up')
          .send({
            username: invalidEmail,
            password: 'ValidPass123!',
          })
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.error.detail).toBe(
              `Email domain not allowed. Allowed domains are: ${allowedDomains.join(
                ', ',
              )}`,
            );
          });
      });
    });

    describe('POST - /auth/sign-in', () => {
      it('Should allow users to sign in when provided a correct username and password', async () => {
        const serviceResponse: ISignInResponse = {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        };
        identityProviderServiceMock.signIn.mockResolvedValueOnce(
          serviceResponse,
        );

        const signInDto: ISignInDto = {
          username: 'admin@test.com',
          password: 'password',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: AUTHENTICATION_NAME,
                attributes: expect.objectContaining({
                  ...serviceResponse,
                }),
              }),
              links: expect.objectContaining({
                self: expect.any(String),
              }),
            });
            expect(body).toEqual(expectedResponse);
          });
      });

      it('Should send an UserNotFound error when provided an invalid username', async () => {
        const signInDto: ISignInDto = {
          username: 'fakeUsername',
          password: 'fakePassword',
        };
        const error = new UsernameNotFoundException({
          username: signInDto.username,
        });
        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('Should send an InvalidPassword error provided a valid user but invalid password', async () => {
        const error = new UnauthorizedException({
          message: 'Wrong email or password.',
        });
        const signInDto: ISignInDto = {
          username: 'regular@test.com',
          password: 'fakePassword',
        };

        identityProviderServiceMock.signIn.mockRejectedValueOnce(error);
        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('Should send an UnconfirmedUser error when user is not confirmed', async () => {
        const error = new UnauthorizedException({
          message: 'Email not verified',
        });
        identityProviderServiceMock.signIn.mockRejectedValueOnce(error);
        const signInDto: ISignInDto = {
          username: 'admin@test.com',
          password: 'password',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('Should send an UnexpectedErrorCode error when receiving uncovered error codes', async () => {
        const error = new UnknownErrorException({
          message: 'Error',
        });
        identityProviderServiceMock.signIn.mockRejectedValueOnce(error);
        const signInDto: ISignInDto = {
          username: 'admin@test.com',
          password: 'password',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('Should send a NewPasswordRequired error when user needs to update their password', async () => {
        const error = new InternalServerErrorException({
          message: 'Internal server error',
        });
        identityProviderServiceMock.signIn.mockRejectedValueOnce(error);
        const signInDto: ISignInDto = {
          username: 'admin@test.com',
          password: 'password',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });
    });

    describe('POST - /auth/confirm-user', () => {
      it('Should confirm a user when provided a correct confirmation code', async () => {
        const successResponse = {
          success: true,
          message: 'User successfully confirmed',
        };
        identityProviderServiceMock.confirmUser.mockResolvedValueOnce(
          successResponse,
        );
        const confirmUserDto: IConfirmUserDto = {
          username: 'confirm@test.com',
          code: '123456',
        };
        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: AUTHENTICATION_NAME,
                attributes: expect.objectContaining({
                  ...successResponse,
                }),
              }),
              links: expect.objectContaining({
                self: expect.any(String),
              }),
            });
            expect(body).toEqual(expectedResponse);
          });
      });

      it('Should send a UserAlreadyConfirmed error when trying to confirm a confirmed user', async () => {
        const error = new UserAlreadyConfirmed({
          message: USER_ALREADY_CONFIRMED_ERROR,
        });

        const confirmUserDto: IConfirmUserDto = {
          code: '123456',
          username: 'confirm@test.com',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.BAD_REQUEST)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
            expect(body.error.source.pointer).toEqual('/user/isVerified');
          });
      });

      it('Should send an UserNotFound error when provided an invalid username', async () => {
        const username = 'fakeUsername';
        const error = new UsernameNotFoundException({
          username,
        });
        const confirmUserDto: IConfirmUserDto = {
          username,
          code: '123456',
        };
        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('Should send a CodeMismatch error when provided an incorrect code', async () => {
        const error = new CodeMismatchException({
          message: 'Error',
        });
        identityProviderServiceMock.confirmUser.mockRejectedValueOnce(error);
        const confirmUserDto: IConfirmUserDto = {
          username: 'error@test.com',
          code: 'FakeCode',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('Should send an ExpiredCode error when provided an expired code', async () => {
        const error = new InternalServerErrorException({
          message: 'Internal server error',
        });
        identityProviderServiceMock.confirmUser.mockRejectedValueOnce(error);
        const confirmUserDto: IConfirmUserDto = {
          username: 'error@test.com',
          code: '123456',
        };
        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
            expect(body.error.source.pointer).toEqual(
              '/api/v1/auth/confirm-user',
            );
          });
      });

      it('Should respond with an UnexpectedErrorCodeException when an unexpected error occurs', async () => {
        const error = new UnknownErrorException({
          message: 'Error',
        });
        identityProviderServiceMock.confirmUser.mockRejectedValueOnce(error);
        const confirmUserDto: IConfirmUserDto = {
          username: 'error@test.com',
          code: '123456',
        };
        await request(app.getHttpServer())
          .post('/api/v1/auth/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });
    });

    describe('POST - /auth/forgot-password', () => {
      const url = '/api/v1/auth/forgot-password';

      it('Should respond with a success message when provided a username to forgot password', async () => {
        identityProviderServiceMock.forgotPassword.mockResolvedValueOnce({
          success: true,
          message: 'Password reset instructions have been sent',
        });
        const forgotPasswordDto: IForgotPasswordDto = {
          username: 'admin@test.com',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body.data.attributes.success).toEqual(true);
          });
      });

      it("Should respond with an UserNotFoundException when the user doesn't exist", async () => {
        const username = 'fakeUsername';
        const error = new UsernameNotFoundException({
          username,
        });
        const forgotPasswordDto: IForgotPasswordDto = { username };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('Should respond with an UnexpectedErrorCodeException when an unexpected error occurs', async () => {
        const error = new UnknownErrorException({
          message: 'Error',
        });
        identityProviderServiceMock.forgotPassword.mockRejectedValueOnce(error);
        const forgotPasswordDto: IForgotPasswordDto = {
          username: 'admin@test.com',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });
    });

    describe('POST - /auth/confirm-password', () => {
      const url = '/api/v1/auth/confirm-password';

      it('Should respond with a success message when provided a username, password and code', async () => {
        identityProviderServiceMock.confirmPassword.mockResolvedValueOnce({
          success: true,
          message: 'Your password has been correctly updated',
        });
        const confirmPasswordDto: IConfirmPasswordDto = {
          username: 'admin@test.com',
          code: '123456',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body.data.attributes.success).toEqual(true);
          });
      });

      it('Should respond with a CodeMismatchError when the code is invalid', async () => {
        const error = new CodeMismatchException({
          message: 'Error',
        });
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: IConfirmPasswordDto = {
          username: 'admin@test.com',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
            expect(body.error.source.pointer).toContain(
              '/api/v1/auth/confirm-password',
            );
          });
      });

      it('Should respond with an UsernameNotFound error when the user does not exist', async () => {
        const username = 'fake@fake.com';
        const error = new UsernameNotFoundException({
          username,
        });
        const confirmPasswordDto: IConfirmPasswordDto = {
          username,
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('Should respond with a PasswordValidationException when password is not strong enough', async () => {
        const error = new UnknownErrorException({
          message: 'Error',
        });
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: IConfirmPasswordDto = {
          username: 'admin@test.com',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('Should respond with an UnexpectedErrorCodeException when an unexpected error occurs', async () => {
        const error = new UnknownErrorException({
          message: 'Error',
        });
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const forgotPasswordDto: IConfirmPasswordDto = {
          username: 'admin@test.com',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('Should respond with an ExpiredCodeException when the code has expired', async () => {
        const error = new UnknownErrorException({
          message: 'Error',
        });
        identityProviderServiceMock.confirmPassword.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: IConfirmPasswordDto = {
          username: 'admin@test.com',
          code: '654321',
          newPassword: 'password',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });
    });

    describe('POST - /auth/resend-confirmation-code', () => {
      const url = '/api/v1/auth/resend-confirmation-code';

      it('Should resend the confirmation code when requested', async () => {
        const successResponse = {
          success: true,
          message: 'A new confirmation code has been sent',
        };
        identityProviderServiceMock.resendConfirmationCode.mockResolvedValueOnce(
          successResponse,
        );
        const confirmPasswordDto: IResendConfirmationCodeDto = {
          username: 'admin@test.com',
        };
        await request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body.data.attributes.success).toEqual(true);
          });
      });

      it("Should respond with an UserNotFoundException when the user doesn't exist", async () => {
        const username = 'fakeUsername';
        const error = new UsernameNotFoundException({
          username,
        });
        const forgotPasswordDto: IForgotPasswordDto = { username };
        await request(app.getHttpServer())
          .post(url)
          .send(forgotPasswordDto)
          .expect(HttpStatus.NOT_FOUND)
          .then(({ body }) => {
            expect(body.error.detail).toEqual(error.message);
          });
      });

      it('Should respond with an UnexpectedCodeError over unexpected errors', async () => {
        const error = new UnknownErrorException({
          message: 'Error',
        });
        identityProviderServiceMock.resendConfirmationCode.mockRejectedValueOnce(
          error,
        );
        const confirmPasswordDto: IResendConfirmationCodeDto = {
          username: 'admin@test.com',
        };
        return request(app.getHttpServer())
          .post(url)
          .send(confirmPasswordDto)
          .expect(HttpStatus.INTERNAL_SERVER_ERROR)
          .then(({ body }) => {
            expect(body?.error?.detail).toEqual(error.message);
          });
      });
    });

    describe('POST - /auth/refresh', () => {
      const url = '/api/v1/auth/refresh';
      it('Should refresh the session when provided a valid refresh token', async () => {
        const successProviderResponse: IRefreshSessionResponse = {
          accessToken: 'accessToken',
        };
        identityProviderServiceMock.refreshSession.mockResolvedValueOnce(
          successProviderResponse,
        );
        const refreshTokenDto: IRefreshSessionDto = {
          refreshToken: 'refreshToken',
        };
        const expectedResponse = expect.objectContaining({
          data: expect.objectContaining({
            attributes: expect.objectContaining({
              accessToken: 'accessToken',
            }),
          }),
        });
        await request(app.getHttpServer())
          .post(url)
          .send(refreshTokenDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body).toEqual(expectedResponse);
          });
      });
    });
  });

  describe('Admin Authentication', () => {
    describe('POST - /auth/admin/sign-up', () => {
      it('Should allow admin sign up when no admin exists', async () => {
        const externalId = '00000000-0000-0000-0000-000000000001';
        identityProviderServiceMock.signUp.mockResolvedValueOnce({
          externalId,
        });

        const signUpDto = {
          username: 'admin.new@test.com',
          password: '$Test123',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/admin/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.CREATED)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  username: signUpDto.username,
                  externalId,
                }),
              }),
            });
            expect(body).toEqual(expectedResponse);
          });
      });

      it('Should not allow admin sign up when an admin already exists', async () => {
        const signUpDto = {
          username: 'admin.second@test.com',
          password: '$Test123',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/admin/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.FORBIDDEN)
          .then(({ body }) => {
            expect(body.error.detail).toBe(
              "Sign-up disabled: 'user' table is not empty",
            );
          });
      });
    });

    describe('POST - /auth/admin/sign-in', () => {
      it('Should allow admin to sign in with valid credentials', async () => {
        const serviceResponse = {
          accessToken: 'adminAccessToken',
          refreshToken: 'adminRefreshToken',
        };
        identityProviderServiceMock.signIn.mockResolvedValueOnce(
          serviceResponse,
        );

        const signInDto = {
          username: 'admin.new@test.com',
          password: '$Test123',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/admin/sign-in')
          .send(signInDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: AUTHENTICATION_NAME,
                attributes: expect.objectContaining({
                  ...serviceResponse,
                }),
              }),
            });
            expect(body).toEqual(expectedResponse);
          });
      });

      it('Should not allow sign in with non-admin credentials', async () => {
        const signInDto = {
          username: 'regular@test.com',
          password: '$Test123',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/admin/sign-in')
          .send(signInDto)
          .expect(HttpStatus.NOT_FOUND);
      });
    });

    describe('POST - /auth/admin/confirm-user', () => {
      it('Should confirm admin user with valid confirmation code', async () => {
        const successResponse = {
          success: true,
          message: 'Admin user successfully confirmed',
        };
        identityProviderServiceMock.confirmUser.mockResolvedValueOnce(
          successResponse,
        );

        const confirmUserDto = {
          username: 'admin.new@test.com',
          code: '123456',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/admin/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                type: AUTHENTICATION_NAME,
                attributes: expect.objectContaining({
                  ...successResponse,
                }),
              }),
            });
            expect(body).toEqual(expectedResponse);
          });
      });

      it('Should not allow confirming non-admin user through admin endpoint', async () => {
        const confirmUserDto = {
          username: 'regular@test.com',
          code: '123456',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/admin/confirm-user')
          .send(confirmUserDto)
          .expect(HttpStatus.NOT_FOUND);
      });
    });

    describe('POST - /auth/admin/forgot-password', () => {
      it('Should handle admin forgot password request', async () => {
        const successResponse = {
          success: true,
          message: 'Password reset instructions have been sent',
        };
        identityProviderServiceMock.forgotPassword.mockResolvedValueOnce(
          successResponse,
        );

        const forgotPasswordDto = {
          username: 'admin.new@test.com',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/admin/forgot-password')
          .send(forgotPasswordDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body.data.attributes.success).toBe(true);
          });
      });
    });

    describe('POST - /auth/admin/confirm-password', () => {
      it('Should confirm admin password reset with valid code', async () => {
        const successResponse = {
          success: true,
          message: 'Admin password has been successfully updated',
        };
        identityProviderServiceMock.confirmPassword.mockResolvedValueOnce(
          successResponse,
        );

        const confirmPasswordDto = {
          username: 'admin.new@test.com',
          code: '123456',
          newPassword: '$NewTest123',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/admin/confirm-password')
          .send(confirmPasswordDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body.data.attributes.success).toBe(true);
          });
      });
    });

    describe('POST - /auth/admin/resend-confirmation-code', () => {
      it('Should resend confirmation code for admin user', async () => {
        const successResponse = {
          success: true,
          message: 'A new confirmation code has been sent',
        };
        identityProviderServiceMock.resendConfirmationCode.mockResolvedValueOnce(
          successResponse,
        );

        const resendConfirmationCodeDto = {
          username: 'admin.new@test.com',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/admin/resend-confirmation-code')
          .send(resendConfirmationCodeDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            expect(body.data.attributes.success).toBe(true);
          });
      });
    });

    describe('POST - /auth/admin/refresh', () => {
      it('Should refresh admin session with valid refresh token', async () => {
        const successResponse = {
          accessToken: 'newAdminAccessToken',
        };
        identityProviderServiceMock.refreshSession.mockResolvedValueOnce(
          successResponse,
        );

        const refreshSessionDto = {
          refreshToken: 'validAdminRefreshToken',
        };

        await request(app.getHttpServer())
          .post('/api/v1/auth/admin/refresh')
          .send(refreshSessionDto)
          .expect(HttpStatus.OK)
          .then(({ body }) => {
            const expectedResponse = expect.objectContaining({
              data: expect.objectContaining({
                attributes: expect.objectContaining({
                  accessToken: successResponse.accessToken,
                }),
              }),
            });
            expect(body).toEqual(expectedResponse);
          });
      });
    });
  });
});
