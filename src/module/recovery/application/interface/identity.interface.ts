import { IDENTITY_ROLE } from '@module/recovery/application/enum/auth-identity-role.enum';
import { IAuthMethod } from '@module/recovery/application/interface/auth-method.interface';

export interface IIdentity {
  role: IDENTITY_ROLE;
  auth_methods: IAuthMethod[];
}
