import { ACCOUNT_WEIGHT } from '@module/recovery/application/enum/account-weight.enum';
import { ACCOUNT_RECOVERY_NODES } from '@module/recovery/domain/account-recovery-node.constant';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { IRecoveryNode } from '@common/infrastructure/recovery/interface/IRecoveryNode.interface';

import { StellarAccountAdapter } from '@/common/infrastructure/stellar/stellar.account.adapter';

import { ACCOUNT_TYPE } from '../enum/account-type.enum';

@Injectable()
export class RecoveryOperationService {
  constructor(
    @Inject(ACCOUNT_RECOVERY_NODES)
    private readonly recoveryNodes: IRecoveryNode[],
    private readonly stellarAccountAdapter: StellarAccountAdapter,
  ) {}

  setAccountWeights(): string {
    return this.stellarAccountAdapter.setAccountSettings({
      lowThreshold: ACCOUNT_WEIGHT.MAX,
      medThreshold: ACCOUNT_WEIGHT.MAX,
      highThreshold: ACCOUNT_WEIGHT.MAX,
      masterWeight: ACCOUNT_WEIGHT.MIN,
    });
  }

  getWeightByAccountType(accountType: ACCOUNT_TYPE): ACCOUNT_WEIGHT {
    switch (accountType) {
      case ACCOUNT_TYPE.DEVICE:
        return ACCOUNT_WEIGHT.MAX;
      case ACCOUNT_TYPE.UNUSED:
        return ACCOUNT_WEIGHT.MIN;
      case ACCOUNT_TYPE.SERVER:
        return Math.ceil(ACCOUNT_WEIGHT.MAX / this.recoveryNodes.length);
      default:
        throw new BadRequestException('Invalid account type');
    }
  }

  addSigner(publicKey: string, accountType: ACCOUNT_TYPE): string {
    const weight = this.getWeightByAccountType(accountType);
    return this.stellarAccountAdapter.addAccountSigners({
      signer: {
        weight,
        ed25519PublicKey: publicKey,
      },
    });
  }
}
