import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { Admin } from '@iam/admin/domain/admin.entity';

export const AdminSchema = new EntitySchema<Admin>({
  name: 'Admin',
  target: Admin,
  tableName: 'admin',
  columns: withBaseSchemaColumns({
    username: {
      type: String,
      unique: true,
    },
    externalId: {
      type: String,
      unique: true,
      nullable: true,
    },
    roles: {
      type: 'simple-array',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  }),
});
