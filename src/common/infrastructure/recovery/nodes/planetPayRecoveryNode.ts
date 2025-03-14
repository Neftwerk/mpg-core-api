import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { AbstractRecoveryNode } from '@common/infrastructure/recovery/recovery.account.adapter';

export class PlanetPayRecoveryNode extends AbstractRecoveryNode {
  private readonly authNode: string;

  constructor(httpService: HttpService, configService: ConfigService) {
    super(httpService);
    this.authNode = configService.get('accountRecovery.planetPayRecoveryNode');
  }

  protected getAuthNode(): string {
    return this.authNode;
  }
}
