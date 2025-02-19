import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';

import { AdminResponseAdapter } from '@iam/admin/application/adapter/admin-responser.adapter';
import { AdminFieldsQueryParamsDto } from '@iam/admin/application/dto/admin-fields-query-params.dto';
import { AdminFilterQueryParamsDto } from '@iam/admin/application/dto/admin-filter-query-params.dto';
import { AdminResponseDto } from '@iam/admin/application/dto/admin-response.dto';
import { AdminSortQueryParamsDto } from '@iam/admin/application/dto/admin-sort-query-params.dto';
import { AdminMapper } from '@iam/admin/application/mapper/admin.mapper';
import { AdminService } from '@iam/admin/application/service/admin.service';
import { Admin } from '@iam/admin/domain/admin.entity';
import { ADMIN_ENTITY_NAME } from '@iam/admin/domain/admin.name';
import { ReadAdminPolicyHandler } from '@iam/authentication/application/policy/read-admin-policy.handler';
import { CurrentAdmin } from '@iam/authentication/infrastructure/decorator/current-admin.decorator';
import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';

@Controller('admin')
@ControllerEntity(ADMIN_ENTITY_NAME)
@ApiTags('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminMapper: AdminMapper,
    private readonly adminResponseAdapter: AdminResponseAdapter,
  ) {}

  @Get()
  @Policies(ReadAdminPolicyHandler)
  async getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: AdminFilterQueryParamsDto,
    @Query('sort') sort: AdminSortQueryParamsDto,
    @Query('fields') fields: AdminFieldsQueryParamsDto,
  ): Promise<ManySerializedResponseDto<AdminResponseDto>> {
    return this.adminService.getAll({
      page,
      filter,
      sort,
      fields: fields.target,
    });
  }

  @Get('me')
  @Policies(ReadAdminPolicyHandler)
  async getMe(
    @CurrentAdmin() admin: Admin,
  ): Promise<OneSerializedResponseDto<AdminResponseDto>> {
    return this.adminResponseAdapter.oneEntityResponse(
      this.adminMapper.fromAdminToAdminResponseDto(admin),
    );
  }
}
