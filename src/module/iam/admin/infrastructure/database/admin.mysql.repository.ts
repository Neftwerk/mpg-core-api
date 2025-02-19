import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { IAdminRepository } from '@iam/admin/application/repository/admin.repository.interface';
import { Admin } from '@iam/admin/domain/admin.entity';
import { AdminSchema } from '@iam/admin/infrastructure/database/admin.schema';
import { AdminNotFoundException } from '@iam/admin/infrastructure/database/exception/admin-not-found.exception';

import { AdminUsernameNotFoundException } from './exception/admin-username-not-found.exception';

export class AdminMysqlRepository implements IAdminRepository {
  constructor(
    @InjectRepository(AdminSchema)
    private readonly repository: Repository<Admin>,
  ) {}

  async getAll(options: IGetAllOptions<Admin>): Promise<ICollection<Admin>> {
    const { filter, page, sort, fields } = options || {};

    const [items, itemCount] = await this.repository.findAndCount({
      where: { ...filter, roles: filter.roles && In(filter.roles) },
      order: sort,
      select: fields,
      take: page.size,
      skip: page.offset,
    });

    return {
      data: items,
      pageNumber: page.number,
      pageSize: page.size,
      pageCount: Math.ceil(itemCount / page.size),
      itemCount,
    };
  }

  async getOneByAdminUsername(username: string): Promise<Admin> {
    return this.repository.findOne({
      where: { username },
    });
  }

  async getOneByExternalId(externalId: string): Promise<Admin> {
    return this.repository.findOne({
      where: { externalId },
    });
  }

  async getOneByAdminUsernameOrFail(username: string) {
    const admin = await this.repository.findOne({
      where: { username },
    });

    if (!admin) {
      throw new AdminUsernameNotFoundException({
        username,
      });
    }

    return admin;
  }

  async saveOne(admin: Admin): Promise<Admin> {
    return this.repository.save(admin);
  }

  async updateOneOrFail(
    id: number,
    updates: Partial<Omit<Admin, 'id'>>,
  ): Promise<Admin> {
    const adminToUpdate = await this.repository.preload({
      id,
      ...updates,
    });

    if (!adminToUpdate) {
      throw new AdminNotFoundException({
        message: `Admin with ID ${id} not found`,
      });
    }

    return this.repository.save(adminToUpdate);
  }
  async countUsers(): Promise<number> {
    return await this.repository.count();
  }
}
