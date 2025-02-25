import { Admin } from '@iam/admin/domain/admin.entity';

export interface IAdmin extends Admin {
  name: string;
  surname: string;
  biography?: string;
}
