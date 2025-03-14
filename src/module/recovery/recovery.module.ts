import { RecoveryOperationService } from '@module/recovery/application/service/recovery.operation.service';
import { RecoveryService } from '@module/recovery/application/service/recovery.service';
import { Sep10AuthService } from '@module/recovery/application/service/sep10AuthService';
import { RecoveryController } from '@module/recovery/controllers/recovery.controller';
import {
  RECOVERY_REPOSITORY,
  RecoveryPostgreSqlRepository,
} from '@module/recovery/infrastructure/database/recovery.postgresql.repository';
import { SignerSchema } from '@module/recovery/infrastructure/database/signers.schema';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';
import { StellarModule } from '@/common/infrastructure/stellar/stellar.module';

import { AccountModule } from '../account/account.module';
import { RecoveryResponseAdapter } from './application/adapter/recovery-response.adapter';
import { SignerResponseMapper } from './application/mapper/signer.response.mapper';

const recoveryRepositoryProvider = {
  provide: RECOVERY_REPOSITORY,
  useClass: RecoveryPostgreSqlRepository,
};

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    StellarModule,
    CommonModule,
    AccountModule,
    TypeOrmModule.forFeature([SignerSchema]),
  ],
  controllers: [RecoveryController],
  providers: [
    RecoveryService,
    Sep10AuthService,
    RecoveryOperationService,
    recoveryRepositoryProvider,
    RecoveryResponseAdapter,
    SignerResponseMapper,
  ],
  exports: [RecoveryService],
})
export class RecoveryModule {}
