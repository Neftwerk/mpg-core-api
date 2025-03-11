import { AccountResponseAdapter } from '@module/account/application/adapter/account-responser.adapter';
import { AccountService } from '@module/account/application/service/account.service';
import { ACCOUNT_SERVICE } from '@module/account/domain/account-service.constant';
import { Module, Provider, forwardRef } from '@nestjs/common';

import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar.account.adapter';
import { StellarModule } from '@common/infrastructure/stellar/stellar.module';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar.transaction.adapter';

import { UserResponseAdapter } from '@iam/user/application/adapter/user-responser.adapter';
import { UserModule } from '@iam/user/user.module';

const accountServiceProvider: Provider = {
  provide: ACCOUNT_SERVICE,
  useClass: AccountService,
};

@Module({
  imports: [forwardRef(() => UserModule), StellarModule],
  providers: [
    accountServiceProvider,
    UserResponseAdapter,
    StellarTransactionAdapter,
    StellarAccountAdapter,
    AccountResponseAdapter,
  ],
  exports: [accountServiceProvider],
})
export class AccountModule {}
