import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { AbstractRecoveryNode } from '@common/infrastructure/recovery/recovery.account.adapter';

export class BiggerRecoveryNode extends AbstractRecoveryNode {
  private readonly authNode: string;

  constructor(httpService: HttpService, configService: ConfigService) {
    super(httpService);
    this.authNode = configService.get('accountRecovery.biggerRecoveryNode');
  }

  protected getAuthNode(): string {
    return this.authNode;
  }
}
