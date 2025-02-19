import { Book } from '@book/domain/book.entity';

import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';

export const bookPermissions: IPermissionsDefinition = {
  regular(_, { can }) {
    can(AppAction.Read, Book);
  },
  admin(_, { can }) {
    can(AppAction.Manage, Book);
  },
};
