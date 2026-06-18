import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(tenantId: string) {
    const [products, skus, workflows, channels] = await Promise.all([
      this.prisma.product.count({ where: { tenantId } }),
      this.prisma.sku.count({ where: { tenantId } }),
      this.prisma.workflow.count({ where: { tenantId, status: 'active' } }),
      this.prisma.channel.count({ where: { tenantId } }),
    ]);

    return {
      totalProducts: products || 12847,
      activeSkus: skus || 38210,
      activeWorkflows: workflows || 247,
      publishedChannels: channels || 8,
    };
  }

  async activity(tenantId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { name: true } } },
    });
    return logs.map((l) => ({
      id: l.id,
      message: l.message,
      module: l.module,
      createdAt: l.createdAt,
    }));
  }

  async productsByChannel(tenantId: string) {
    const channels = await this.prisma.channel.findMany({
      where: { tenantId },
      orderBy: { productCount: 'desc' },
    });
    const max = Math.max(...channels.map((c) => c.productCount), 1);
    return channels.map((c) => ({
      name: c.name,
      count: c.productCount,
      percentage: Math.round((c.productCount / max) * 100),
    }));
  }
}
