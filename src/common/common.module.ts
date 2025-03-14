import { Module } from '@nestjs/common';

import { AccountRecoveryModule } from '@common/infrastructure/recovery/recovery.account.module';
import { StellarModule } from '@common/infrastructure/stellar/stellar.module';

@Module({
  imports: [StellarModule, AccountRecoveryModule],
  exports: [StellarModule, AccountRecoveryModule],
})
export class CommonModule {}
