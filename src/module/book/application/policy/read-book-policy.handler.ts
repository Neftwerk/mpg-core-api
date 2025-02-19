import { ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { Book } from '@book/domain/book.entity';

import { REQUEST_USER_KEY } from '@iam/authentication/authentication.constants';
import { AuthorizationService } from '@iam/authorization/application/service/authorization.service';
import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPolicyHandler } from '@iam/authorization/infrastructure/policy/handler/policy-handler.interface';
import { PolicyHandlerStorage } from '@iam/authorization/infrastructure/policy/storage/policies-handler.storage';
import { User } from '@iam/user/domain/user.entity';

@Injectable()
export class ReadBookPolicyHandler implements IPolicyHandler {
  private readonly action = AppAction.Read;

  constructor(
    private readonly policyHandlerStorage: PolicyHandlerStorage,
    private readonly authorizationService: AuthorizationService,
  ) {
    this.policyHandlerStorage.add(ReadBookPolicyHandler, this);
  }

  async handle(request: Request): Promise<void> {
    const currentUser = this.getCurrentUser(request);

    const isAllowed = await this.authorizationService.isAllowed(
      currentUser,
      this.action,
      Book,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You are not allowed to ${this.action.toUpperCase()} this resource`,
      );
    }
  }

  private getCurrentUser(request: Request): User {
    return request[REQUEST_USER_KEY];
  }
}
