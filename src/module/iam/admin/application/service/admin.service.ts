import { Inject, Injectable } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { AdminResponseAdapter } from '@iam/admin/application/adapter/admin-responser.adapter';
import { AdminResponseDto } from '@iam/admin/application/dto/admin-response.dto';
import { AdminMapper } from '@iam/admin/application/mapper/admin.mapper';
import {
  ADMIN_REPOSITORY_KEY,
  IAdminRepository,
} from '@iam/admin/application/repository/admin.repository.interface';
import { Admin } from '@iam/admin/domain/admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @Inject(ADMIN_REPOSITORY_KEY)
    private readonly adminRepository: IAdminRepository,
    private readonly adminMapper: AdminMapper,
    private readonly adminResponseAdapter: AdminResponseAdapter,
  ) {}

  async getAll(
    options: IGetAllOptions<Admin>,
  ): Promise<ManySerializedResponseDto<AdminResponseDto>> {
    const collection = await this.adminRepository.getAll(options);
    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((admin) =>
        this.adminMapper.fromAdminToAdminResponseDto(admin),
      ),
    });

    return this.adminResponseAdapter.manyEntitiesResponse(collectionDto);
  }
}
