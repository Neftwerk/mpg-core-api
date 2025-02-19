import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Admin } from '@iam/admin/domain/admin.entity';
import { REQUEST_USER_KEY } from '@iam/authentication/authentication.constants';

export const CurrentAdmin = createParamDecorator(
  (field: keyof Admin, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: Admin | undefined = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
