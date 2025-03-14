import { Signer } from '@module/recovery/domain/signer.entity';
import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

export const SignerSchema = new EntitySchema<Signer>({
  name: 'Signer',
  target: Signer,
  tableName: 'signer',
  columns: withBaseSchemaColumns({
    publicKey: {
      type: String,
      unique: true,
    },
    domain: {
      type: String,
    },
  }),
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: true,
      onDelete: 'CASCADE',
    },
  },
});
