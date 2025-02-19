import { Genre } from '@genre/domain/genre.entity';

import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';

export const genrePermissions: IPermissionsDefinition = {
  regular(_, { can }) {
    can(AppAction.Read, Genre);
    can(AppAction.Update, Genre);
  },
  admin(_, { can }) {
    can(AppAction.Manage, Genre);
    can(AppAction.Update, Genre);
  },
};
