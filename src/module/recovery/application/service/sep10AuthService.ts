import { IServerDomainKeyValue } from '@module/recovery/application/interface/server-domain-key-value.interface';
import { ACCOUNT_RECOVERY_NODES } from '@module/recovery/domain/account-recovery-node.constant';
import { Inject, Injectable } from '@nestjs/common';

import { IRecoveryNode } from '@common/infrastructure/recovery/interface/IRecoveryNode.interface';

@Injectable()
export class Sep10AuthService {
  constructor(
    @Inject(ACCOUNT_RECOVERY_NODES)
    private readonly recoveryNodes: IRecoveryNode[],
  ) {}

  async generateSep10Challenge(
    publicKey: string,
  ): Promise<IServerDomainKeyValue> {
    const challenges = await Promise.all(
      this.recoveryNodes.map(async (node) => {
        const domain = await node.getNodeDomain();
        const challenge = await node.getSep10Challenge(publicKey);
        return { [domain]: challenge };
      }),
    );
    return Object.assign({}, ...challenges);
  }

  async generateSep10Token(
    signedChallenges: IServerDomainKeyValue,
  ): Promise<IServerDomainKeyValue> {
    const tokens = await Promise.all(
      this.recoveryNodes.map(async (node) => {
        const domain = await node.getNodeDomain();
        const signedChallenge = signedChallenges[domain];
        const token = await node.getSep10Token(signedChallenge);
        return { [domain]: token };
      }),
    );
    return Object.assign({}, ...tokens);
  }
}
