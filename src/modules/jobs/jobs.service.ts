import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { paginated } from '../../shared/dto/pagination.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  listImports(tenantId: string, page = 1, pageSize = 20) {
    return this.paginate(this.prisma.importJob, tenantId, page, pageSize);
  }

  createImport(tenantId: string, body: { type: string }) {
    const code = `IMP-${Date.now().toString().slice(-4)}`;
    return this.prisma.importJob.create({ data: { tenantId, code, type: body.type, status: 'pending' } });
  }

  listExports(tenantId: string, page = 1, pageSize = 20) {
    return this.paginate(this.prisma.exportJob, tenantId, page, pageSize);
  }

  createExport(tenantId: string, body: { type: string }) {
    const code = `EXP-${Date.now().toString().slice(-4)}`;
    return this.prisma.exportJob.create({ data: { tenantId, code, type: body.type, status: 'pending' } });
  }

  private async paginate(
    model: { findMany: (args: object) => Promise<unknown[]>; count: (args: object) => Promise<number> },
    tenantId: string,
    page: number,
    pageSize: number,
  ) {
    const where = { tenantId };
    const [data, total] = await Promise.all([
      model.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }),
      model.count({ where }),
    ]);
    return paginated(data, total, page, pageSize);
  }
}
