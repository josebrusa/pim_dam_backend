import { Injectable } from '@nestjs/common';
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

  invite(tenantId: string, body: { email: string; roleCode: string }) {
    return { invited: true, email: body.email, role: body.roleCode, tenantId, status: 'pending' };
  }

  roles() {
    return this.prisma.role.findMany({ orderBy: { code: 'asc' } });
  }

  permissions() {
    return this.prisma.permission.findMany({ orderBy: { module: 'asc' } });
  }
}
