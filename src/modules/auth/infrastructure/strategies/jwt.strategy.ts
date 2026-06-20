import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { extractAuthTokenFromCookie } from '../auth-cookie';

export type JwtPayload = {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: { headers?: { cookie?: string } }) => extractAuthTokenFromCookie(request?.headers?.cookie),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        memberships: {
          where: { tenantId: payload.tenantId, status: 'active' },
          include: {
            role: {
              include: { rolePermissions: { include: { permission: true } } },
            },
            tenant: true,
          },
        },
      },
    });

    const membership = user?.memberships[0];
    if (!user || !membership) return null;

    const permissions =
      membership.role.code === 'PIM_MANAGER' || membership.role.code === 'IT_ADMIN'
        ? ['*']
        : membership.role.rolePermissions.map((rp: { permission: { code: string } }) => rp.permission.code);

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      initials: user.initials,
      role: membership.role.code,
      tenantId: membership.tenantId,
      tenantName: membership.tenant.name,
      permissions,
    };
  }
}
