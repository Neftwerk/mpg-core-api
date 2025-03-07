import { Injectable } from '@nestjs/common';

import { IUser } from '@iam/authorization/application/interfaces/user.interface';
import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { CaslAbilityFactory } from '@iam/authorization/infrastructure/casl/factory/casl-ability.factory';
import { AppSubjects } from '@iam/authorization/infrastructure/casl/type/app-subjects.type';

@Injectable()
export class AuthorizationService {
  constructor(private readonly abilityFactory: CaslAbilityFactory) {}

  isAllowed(user: IUser, action: AppAction, subject: AppSubjects): boolean {
    if (!user) {
      return false;
    }

    if (!action || !subject) {
      return false;
    }

    const userAbility = this.abilityFactory.createForUser(user);
    return userAbility.can(action, subject);
  }
}
