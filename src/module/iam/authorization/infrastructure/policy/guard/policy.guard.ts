import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Request } from 'express';

import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import {
  GENERIC_POLICY_KEY,
  GenericPolicyMetadata,
  POLICIES_KEY,
} from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { createGenericPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/generic-policy.handler';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<Type<IPolicyHandler>[]>(
        POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const genericPolicy = this.reflector.get<GenericPolicyMetadata>(
      GENERIC_POLICY_KEY,
      context.getHandler(),
    );

    const handlers: IPolicyHandler[] = [];

    for (const Handler of policyHandlers) {
      const handler = this.policyHandlerStorage.get(Handler);
      if (handler) {
        handlers.push(handler);
      }
    }

    if (genericPolicy) {
      const { action, entityType } = genericPolicy;
      const genericHandler = createGenericPolicyHandler(
        action,
        entityType,
        this.policyHandlerStorage,
        this.authorizationService,
      );
      handlers.push(genericHandler);
    }

    if (!handlers.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    for (const handler of handlers) {
      await handler.handle(request);
    }

    return true;
  }
}
