import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { Admin } from '@iam/admin/domain/admin.entity';

export const ADMIN_REPOSITORY_KEY = 'admin_repository';

export interface IAdminRepository {
  getAll(options: IGetAllOptions<Admin>): Promise<ICollection<Admin>>;
  getOneByAdminUsername(username: string): Promise<Admin>;
  getOneByExternalId(externalId: string): Promise<Admin>;
  getOneByAdminUsernameOrFail(username: string): Promise<Admin>;
  saveOne(admin: Admin): Promise<Admin>;
  updateOneOrFail(
    id: number,
    updates: Partial<Omit<Admin, 'id'>>,
  ): Promise<Admin>;
  countUsers(): Promise<number>;
}
