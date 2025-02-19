import { Inject, Injectable } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { UserResponseAdapter } from '@iam/user/application/adapter/user-responser.adapter';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { UserMapper } from '@iam/user/application/mapper/user.mapper';
import {
  IUserRepository,
  USER_REPOSITORY_KEY,
} from '@iam/user/application/repository/user.repository.interface';
import { User } from '@iam/user/domain/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY_KEY)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
    private readonly userResponseAdapter: UserResponseAdapter,
  ) {}

  async getAll(
    options: IGetAllOptions<User>,
  ): Promise<ManySerializedResponseDto<UserResponseDto>> {
    const collection = await this.userRepository.getAll(options);
    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((user) =>
        this.userMapper.fromUserToUserResponseDto(user),
      ),
    });

    return this.userResponseAdapter.manyEntitiesResponse(collectionDto);
  }
}
