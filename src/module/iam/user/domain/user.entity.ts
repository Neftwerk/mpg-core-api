import { Base } from '@common/base/domain/base.entity';

import { AppRole } from '@iam/authorization/domain/app-role.enum';

export class User extends Base {
  username: string;
  externalId?: string;
  roles: AppRole[];
  isVerified: boolean;
  name: string;
  surname: string;
  biography?: string;
  masterKey?: string;

  constructor(
    username: string,
    roles: AppRole[],
    name: string,
    surname: string,
    isVerified: boolean,
    externalId?: string,
    biography?: string,
    id?: number,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: string,
    masterKey?: string,
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this.username = username;
    this.externalId = externalId;
    this.roles = roles;
    this.isVerified = isVerified;
    this.name = name;
    this.surname = surname;
    this.biography = biography;
    this.masterKey = masterKey;
  }
}
