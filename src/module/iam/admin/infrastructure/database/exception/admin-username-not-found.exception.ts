import { NotFoundException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

import { ADMIN_USERNAME_NOT_FOUND_ERROR } from '@iam/admin/infrastructure/database/exception/admin-exception-messages';

type Params = Omit<IBaseErrorInfoParams, 'message'> & { username: string };
export class AdminUsernameNotFoundException extends NotFoundException {
  constructor(params: Params) {
    const message = `${params.username} ${ADMIN_USERNAME_NOT_FOUND_ERROR}`;
    super({ ...params, message });
  }
}
