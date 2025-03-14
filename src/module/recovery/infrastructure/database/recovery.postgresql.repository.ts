import { Signer } from '@module/recovery/domain/signer.entity';
import { SignerSchema } from '@module/recovery/infrastructure/database/signers.schema';
import { IRecoveryRepository } from '@module/recovery/repository/recovery.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export const RECOVERY_REPOSITORY = 'RECOVERY_REPOSITORY';

export class RecoveryPostgreSqlRepository implements IRecoveryRepository {
  constructor(
    @InjectRepository(SignerSchema)
    private readonly repository: Repository<Signer>,
  ) {}

  async saveOne(signer: Signer): Promise<Signer> {
    return await this.repository.save(signer);
  }

  async getByUserExternalId(externalId: string): Promise<Signer[]> {
    return await this.repository.find({
      where: { user: { externalId } },
    });
  }
}
