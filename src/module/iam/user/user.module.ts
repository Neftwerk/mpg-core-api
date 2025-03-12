import { AccountResponseAdapter } from '@module/account/application/adapter/account-responser.adapter';
import { AccountService } from '@module/account/application/service/account.service';
import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar.account.adapter';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar.transaction.adapter';

import { ReadUserPolicyHandler } from '@iam/authentication/application/policy/read-user-policy.handler';
import { AuthorizationModule } from '@iam/authorization/authorization.module';
import { UserResponseAdapter } from '@iam/user/application/adapter/user-responser.adapter';
import { UserMapper } from '@iam/user/application/mapper/user.mapper';
import { USER_REPOSITORY_KEY } from '@iam/user/application/repository/user.repository.interface';
import { UserService } from '@iam/user/application/service/user.service';
import { userPermissions } from '@iam/user/domain/user.permission';
import { UserPostgresqlRepository } from '@iam/user/infrastructure/database/user.postgresql.repository';
import { UserSchema } from '@iam/user/infrastructure/database/user.schema';
import { UserController } from '@iam/user/interface/user.controller';

const policyHandlersProviders = [ReadUserPolicyHandler];

const userRepositoryProvider: Provider = {
  provide: USER_REPOSITORY_KEY,
  useClass: UserPostgresqlRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema]),
    AuthorizationModule.forFeature({ permissions: userPermissions }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    userRepositoryProvider,
    UserMapper,
    UserResponseAdapter,
    AccountService,
    AccountResponseAdapter,
    StellarTransactionAdapter,
    StellarAccountAdapter,
    ...policyHandlersProviders,
  ],
  exports: [UserService, userRepositoryProvider, UserMapper],
})
export class UserModule {}
