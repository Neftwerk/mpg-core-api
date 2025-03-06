import {
  AbilityBuilder,
  ExtractSubjectType,
  createMongoAbility,
} from '@casl/ability';
import { Inject, Injectable } from '@nestjs/common';

import { IUser } from '@iam/authorization/application/interfaces/user.interface';
import { PERMISSIONS_FOR_FEATURE_KEY } from '@iam/authorization/authorization.constants';
import { AppAbility } from '@iam/authorization/infrastructure/casl/type/app-ability.type';
import { AppSubjects } from '@iam/authorization/infrastructure/casl/type/app-subjects.type';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';

@Injectable()
export class CaslAbilityFactory {
  constructor(
    @Inject(PERMISSIONS_FOR_FEATURE_KEY)
    private readonly permissions: IPermissionsDefinition,
  ) {}

  createForUser(user: IUser): AppAbility {
    const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

    user.roles.forEach((role) => {
      this.permissions[role](user, builder);
    });

    return builder.build({
      // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<AppSubjects>,
    });
  }
}
