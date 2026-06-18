import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { paginated } from '../../shared/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, page = 1, pageSize = 20) {
    const [memberships, total] = await Promise.all([
      this.prisma.membership.findMany({
        where: { tenantId },
        include: { user: true, role: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.membership.count({ where: { tenantId } }),
    ]);
    const data = memberships.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role.code,
      status: m.status,
      lastAccess: m.updatedAt,
    }));
    return paginated(data, total, page, pageSize);
  }

  async invite(tenantId: string, body: { email: string; roleCode: string }) {
    const role = await this.prisma.role.findUnique({ where: { code: body.roleCode } });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const email = body.email.trim().toLowerCase();
    const localPart = email.split('@')[0] ?? 'user';
    const name = localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    const initials = localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'US';

    const passwordHash = await bcrypt.hash(`invite:${email}:${Date.now()}`, 10);
    const user = await this.prisma.user.upsert({
      where: { email },
      update: { name: name || email, initials, passwordHash },
      create: { email, name: name || email, initials, passwordHash },
    });

    const membership = await this.prisma.membership.upsert({
      where: { tenantId_userId: { tenantId, userId: user.id } },
      update: { roleId: role.id, status: 'pending' },
      create: { tenantId, userId: user.id, roleId: role.id, status: 'pending' },
      include: { role: true, tenant: true, user: true },
    });

    return {
      invited: true,
      userId: user.id,
      email: user.email,
      role: membership.role.code,
      tenantId: membership.tenantId,
      status: membership.status,
    };
  }

  roles() {
    return this.prisma.role.findMany({ orderBy: { code: 'asc' } });
  }

  permissions() {
    return this.prisma.permission.findMany({ orderBy: { module: 'asc' } });
  }
}
