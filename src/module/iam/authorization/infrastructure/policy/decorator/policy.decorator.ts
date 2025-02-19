import { SetMetadata, Type } from '@nestjs/common';

import { Base } from '@common/base/domain/base.entity';

import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';

export const POLICIES_KEY = 'policies';
export const GENERIC_POLICY_KEY = 'generic_policy';

export interface GenericPolicyMetadata {
  action: AppAction;
  entityType: Type<Base>;
}

export const Policy = (action: AppAction, entityType: Type<Base>) =>
  SetMetadata(GENERIC_POLICY_KEY, { action, entityType });

export const Policies = (...handlers: Type<IPolicyHandler>[]) =>
  SetMetadata(POLICIES_KEY, handlers);
