import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const RecoveryToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const headers = request.headers;
    const RECOVERY_TOKEN_HEADER = 'recovery-token';

    return Object.keys(headers)
      .filter((key) => key.includes(RECOVERY_TOKEN_HEADER))
      .reduce((tokens, key) => {
        const domain = key.split(`-${RECOVERY_TOKEN_HEADER}`)[0];
        tokens[domain] = headers[key];
        return tokens;
      }, {});
  },
);
