import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { paginated } from '../../shared/dto/pagination.dto';

@Injectable()
export class GdsnService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, page = 1, pageSize = 20) {
    const [data, total] = await Promise.all([
      this.prisma.gdsnPublication.findMany({ where: { tenantId }, skip: (page - 1) * pageSize, take: pageSize, orderBy: { sentAt: 'desc' } }),
      this.prisma.gdsnPublication.count({ where: { tenantId } }),
    ]);
    const stats = {
      registered: await this.prisma.gdsnPublication.count({ where: { tenantId } }),
      sentToday: await this.prisma.gdsnPublication.count({ where: { tenantId, sentAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      pending: await this.prisma.gdsnPublication.count({ where: { tenantId, status: 'pending' } }),
      rejected: await this.prisma.gdsnPublication.count({ where: { tenantId, status: 'rejected' } }),
    };
    return { stats, ...paginated(data, total, page, pageSize) };
  }

  create(tenantId: string, body: { gtin: string; productName: string; dataPool: string; recipient: string }) {
    return this.prisma.gdsnPublication.create({
      data: { tenantId, ...body, status: 'pending', sentAt: new Date() },
    });
  }
}
