import { ACCOUNT_RECOVERY_NODES } from '@module/recovery/domain/account-recovery-node.constant';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { BiggerRecoveryNode } from '@common/infrastructure/recovery/nodes/biggerRecoveryNode';
import { PlanetPayRecoveryNode } from '@common/infrastructure/recovery/nodes/planetPayRecoveryNode';

const recoveryNodesProvider = {
  provide: ACCOUNT_RECOVERY_NODES,
  useFactory: (httpService: HttpService, configService: ConfigService) => {
    return [
      new PlanetPayRecoveryNode(httpService, configService),
      new BiggerRecoveryNode(httpService, configService),
    ];
  },
  inject: [HttpService, ConfigService],
};

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [recoveryNodesProvider],
  exports: [recoveryNodesProvider],
})
export class AccountRecoveryModule {}
