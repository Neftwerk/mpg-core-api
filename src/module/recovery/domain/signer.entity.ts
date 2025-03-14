import { User } from '@sentry/nestjs';

import { Base } from '@common/base/domain/base.entity';

export class Signer extends Base {
  publicKey: string;
  domain: string;
  user: User;

  constructor(
    publicKey: string,
    domain: string,
    user: User,
    id?: number,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: string,
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this.publicKey = publicKey;
    this.domain = domain;
    this.user = user;
  }
}
