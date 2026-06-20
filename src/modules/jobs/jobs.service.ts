import { Injectable, NotFoundException } from '@nestjs/common';
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

  async updateImport(tenantId: string, id: string, body: { type?: string; status?: string }) {
    const job = await this.prisma.importJob.findFirst({ where: { id, tenantId } });
    if (!job) throw new NotFoundException('Import job no encontrado');
    return this.prisma.importJob.update({ where: { id }, data: body });
  }

  async removeImport(tenantId: string, id: string) {
    const job = await this.prisma.importJob.findFirst({ where: { id, tenantId } });
    if (!job) throw new NotFoundException('Import job no encontrado');
    return this.prisma.importJob.delete({ where: { id } });
  }

  listExports(tenantId: string, page = 1, pageSize = 20) {
    return this.paginate(this.prisma.exportJob, tenantId, page, pageSize);
  }

  createExport(tenantId: string, body: { type: string }) {
    const code = `EXP-${Date.now().toString().slice(-4)}`;
    return this.prisma.exportJob.create({ data: { tenantId, code, type: body.type, status: 'pending' } });
  }

  async updateExport(tenantId: string, id: string, body: { type?: string; status?: string }) {
    const job = await this.prisma.exportJob.findFirst({ where: { id, tenantId } });
    if (!job) throw new NotFoundException('Export job no encontrado');
    return this.prisma.exportJob.update({ where: { id }, data: body });
  }

  async removeExport(tenantId: string, id: string) {
    const job = await this.prisma.exportJob.findFirst({ where: { id, tenantId } });
    if (!job) throw new NotFoundException('Export job no encontrado');
    return this.prisma.exportJob.delete({ where: { id } });
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
