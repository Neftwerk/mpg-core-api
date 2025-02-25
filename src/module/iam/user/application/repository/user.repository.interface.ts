import { ICollection } from '@common/base/application/dto/collection.interface';
import {
  FilterOptions,
  IGetAllOptions,
} from '@common/base/application/interface/get-all-options.interface';

import { User } from '@iam/user/domain/user.entity';

export const USER_REPOSITORY_KEY = 'user_repository';

export interface IUserRepository {
  getAll(options: IGetAllOptions<User>): Promise<ICollection<User>>;
  getOneByFilter(filter: FilterOptions<User>): Promise<User>;
  getOneByUsername(username: string): Promise<User>;
  getOneByExternalId(externalId: string): Promise<User>;
  getOneByUsernameOrFail(username: string): Promise<User>;
  saveOne(user: User): Promise<User>;
  updateOneOrFail(
    id: number,
    updates: Partial<Omit<User, 'id'>>,
  ): Promise<User>;
}
