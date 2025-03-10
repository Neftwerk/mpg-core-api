import { Module } from '@nestjs/common';

import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar.account.adapter';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar.transaction.adapter';

@Module({
  providers: [StellarTransactionAdapter, StellarAccountAdapter],
  exports: [StellarTransactionAdapter, StellarAccountAdapter],
})
export class StellarModule {}
