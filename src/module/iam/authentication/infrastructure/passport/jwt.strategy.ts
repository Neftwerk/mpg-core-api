import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ENVIRONMENT } from '@config/environment.enum';

import { IAccessTokenPayload } from '@iam/authentication/infrastructure/passport/access-token-payload.interface';
import {
  IUserRepository,
  USER_REPOSITORY_KEY,
} from '@iam/user/application/repository/user.repository.interface';
import { User } from '@iam/user/domain/user.entity';

import { JWT_AUTOMATED_TESTS_SECRET } from '@test/test.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_REPOSITORY_KEY)
    private readonly userRepository: IUserRepository,
  ) {
    /* istanbul ignore next */
    const options =
      process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TESTS
        ? {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_AUTOMATED_TESTS_SECRET,
          }
        : {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            _audience: configService.get('auth0.clientId'),
            issuer: `https://${configService.get('auth0.domain')}/`,
            algorithms: ['RS256'],
            secretOrKeyProvider: passportJwtSecret({
              cache: true,
              rateLimit: true,
              jwksRequestsPerMinute: 5,
              jwksUri: `https://${configService.get(
                'auth0.domain',
              )}/.well-known/jwks.json`,
            }),
          };

    super(options);
  }

  async validate(accessTokenPayload: IAccessTokenPayload): Promise<User> {
    const formattedSub = accessTokenPayload.sub.replace(
      this.configService.get('jwt.providerPrefix'),
      '',
    );

    const currentUser =
      await this.userRepository.getOneByExternalId(formattedSub);

    if (!currentUser) {
      throw new ForbiddenException();
    }
    return currentUser;
  }
}
