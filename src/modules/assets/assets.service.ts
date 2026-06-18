import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { paginated } from '../../shared/dto/pagination.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, page = 1, pageSize = 20) {
    const [data, total] = await Promise.all([
      this.prisma.digitalAsset.findMany({
        where: { tenantId },
        include: { product: { select: { code: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.digitalAsset.count({ where: { tenantId } }),
    ]);
    const totalBytes = await this.prisma.digitalAsset.aggregate({ where: { tenantId }, _sum: { sizeBytes: true } });
    const linked = await this.prisma.digitalAsset.count({ where: { tenantId, productId: { not: null } } });
    const stats = {
      total: total,
      storageGb: ((totalBytes._sum.sizeBytes ?? 0) / 1e9).toFixed(1),
      linked,
      unassigned: total - linked,
    };
    return { stats, ...paginated(data, total, page, pageSize) };
  }

  create(tenantId: string, body: { name: string; type: string; sizeBytes: number; productId?: string; channel?: string }) {
    return this.prisma.digitalAsset.create({ data: { tenantId, ...body } });
  }
}
