import { Signer } from '@module/recovery/domain/signer.entity';

export const RECOVERY_REPOSITORY_KEY = 'RECOVERY_REPOSITORY';

export interface IRecoveryRepository {
  saveOne(server: Signer): Promise<Signer>;
  getByUserExternalId(externalId: string): Promise<Signer[]>;
}
