import { Base } from '@common/base/domain/base.entity';

import { AppRole } from '@iam/authorization/domain/app-role.enum';

interface IUser extends Base {
  username: string;
  externalId?: string;
  roles: AppRole[];
  isVerified: boolean;
  name: string;
  surname: string;
  biography?: string;
}

export class User extends Base {
  username: string;
  externalId?: string;
  roles: AppRole[];
  isVerified: boolean;
  name: string;
  surname: string;
  biography?: string;

  constructor({
    username,
    externalId,
    roles,
    isVerified,
    name,
    surname,
    biography,
    id,
    createdAt,
    updatedAt,
    deletedAt,
  }: IUser) {
    super(id, createdAt, updatedAt, deletedAt);
    this.username = username;
    this.externalId = externalId;
    this.roles = roles;
    this.isVerified = isVerified;
    this.name = name;
    this.surname = surname;
    this.biography = biography;
  }
}
