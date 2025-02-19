import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';

import { ReadUserPolicyHandler } from '@iam/authentication/application/policy/read-user-policy.handler';
import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { UserResponseAdapter } from '@iam/user/application/adapter/user-responser.adapter';
import { UserFieldsQueryParamsDto } from '@iam/user/application/dto/user-fields-query-params.dto';
import { UserFilterQueryParamsDto } from '@iam/user/application/dto/user-filter-query-params.dto';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { UserSortQueryParamsDto } from '@iam/user/application/dto/user-sort-query-params.dto';
import { UserMapper } from '@iam/user/application/mapper/user.mapper';
import { UserService } from '@iam/user/application/service/user.service';
import { User } from '@iam/user/domain/user.entity';
import { USER_ENTITY_NAME } from '@iam/user/domain/user.name';

@Controller('user')
@ControllerEntity(USER_ENTITY_NAME)
@ApiTags('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
    private readonly userResponseAdapter: UserResponseAdapter,
  ) {}

  @Get()
  @Policies(ReadUserPolicyHandler)
  async getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: UserFilterQueryParamsDto,
    @Query('sort') sort: UserSortQueryParamsDto,
    @Query('fields') fields: UserFieldsQueryParamsDto,
  ): Promise<ManySerializedResponseDto<UserResponseDto>> {
    return this.userService.getAll({
      page,
      filter,
      sort,
      fields: fields.target,
    });
  }

  @Get('me')
  @Policies(ReadUserPolicyHandler)
  async getMe(
    @CurrentUser() user: User,
  ): Promise<OneSerializedResponseDto<UserResponseDto>> {
    return this.userResponseAdapter.oneEntityResponse(
      this.userMapper.fromUserToUserResponseDto(user),
    );
  }
}
