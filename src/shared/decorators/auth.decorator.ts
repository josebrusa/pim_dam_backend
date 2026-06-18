import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthUser = {
  userId: string;
  email: string;
  name: string;
  initials: string;
  role: string;
  tenantId: string;
  permissions: string[];
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.tenantId;
  },
);
