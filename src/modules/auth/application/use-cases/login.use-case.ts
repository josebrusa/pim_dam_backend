import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { status: 'active' },
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
            tenant: true,
          },
        },
      },
    });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales incorrectas',
      });
    }

    const membership = user.memberships[0];
    if (!membership) {
      throw new UnauthorizedException({
        code: 'NO_MEMBERSHIP',
        message: 'Usuario sin tenant activo',
      });
    }

    const permissions =
      membership.role.code === 'PIM_MANAGER' || membership.role.code === 'IT_ADMIN'
        ? ['*']
        : membership.role.rolePermissions.map((rp: { permission: { code: string } }) => rp.permission.code);

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: membership.tenantId,
      role: membership.role.code,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        initials: user.initials,
        role: membership.role.code,
        tenantId: membership.tenantId,
        tenantName: membership.tenant.name,
        permissions,
      },
    };
  }
}
