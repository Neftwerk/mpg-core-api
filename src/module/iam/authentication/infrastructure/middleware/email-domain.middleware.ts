import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class EmailDomainMiddleware implements NestMiddleware {
  private readonly allowedDomains: string[];

  constructor() {
    this.allowedDomains = process.env.AUTH_ALLOWED_EMAIL_DOMAINS.split(',');
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST' && req.body?.username) {
      const email = req.body.username.toLowerCase();
      const domain = email.split('@')[1];

      if (!domain || !this.allowedDomains.includes(domain)) {
        throw new UnauthorizedException(
          `Email domain not allowed. Allowed domains are: ${this.allowedDomains.join(
            ', ',
          )}`,
        );
      }
    }

    next();
  }
}
