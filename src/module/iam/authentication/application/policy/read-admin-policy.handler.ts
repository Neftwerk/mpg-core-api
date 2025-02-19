import { ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { Admin } from '@iam/admin/domain/admin.entity';
import { REQUEST_USER_KEY } from '@iam/authentication/authentication.constants';
import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';

@Injectable()
export class ReadAdminPolicyHandler implements IPolicyHandler {
  private readonly action = AppAction.Read;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
  ) {
    this.policyHandlerStorage.add(ReadAdminPolicyHandler, this);
  }

  async handle(request: Request): Promise<void> {
    const currentAdmin = this.getCurrentAdmin(request);

    const isAllowed = await this.authorizationService.isAllowed(
      currentAdmin,
      this.action,
      Admin,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }

  private getCurrentAdmin(request: Request): Admin {
    return request[REQUEST_USER_KEY];
  }
}
