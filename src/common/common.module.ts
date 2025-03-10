import { Module } from '@nestjs/common';

import { StellarModule } from '@common/infrastructure/stellar/stellar.module';

@Module({
  providers: [StellarModule],
  exports: [StellarModule],
})
export class CommonModule {}
