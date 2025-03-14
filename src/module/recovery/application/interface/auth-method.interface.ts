import { AUTH_METHOD_TYPE } from '@module/recovery/application/enum/auth-method-type.enum';

export interface IAuthMethod {
  type: AUTH_METHOD_TYPE;
  value: string;
}
