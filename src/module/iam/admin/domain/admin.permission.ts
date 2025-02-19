import { Admin } from '@iam/admin/domain/admin.entity';
import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';

export const adminPermissions: IPermissionsDefinition = {
  regular(admin, { can }) {
    can(AppAction.Read, Admin);
    can(AppAction.Update, Admin, { id: admin.id }); // Can only update himself
  },
  admin(_, { can }) {
    can(AppAction.Manage, Admin);
  },
};
