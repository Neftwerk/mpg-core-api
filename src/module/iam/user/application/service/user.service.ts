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
import { UserNotFoundException } from '@iam/user/infrastructure/database/exception/user-not-found.exception';

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

  async addWalletToUser(userExternalId: string, masterKey: string) {
    const user = await this.userRepository.getOneByExternalId(userExternalId);
    if (!user) {
      throw new UserNotFoundException({
        message: `User with externalId ${userExternalId} not found`,
      });
    }
    const updatedUser = await this.userRepository.updateOneOrFail(user.id, {
      masterKey,
    });

    return this.userResponseAdapter.oneEntityResponse<UserResponseDto>(
      this.userMapper.fromUserToUserResponseDto(updatedUser),
    );
  }
}
