import { Injectable, NotFoundException } from '@nestjs/common';
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
    if (body.productId) {
      return this.createWithValidatedProduct(tenantId, body);
    }
    return this.prisma.digitalAsset.create({ data: { tenantId, ...body } });
  }

  async update(tenantId: string, id: string, body: { name?: string; type?: string; sizeBytes?: number; productId?: string; channel?: string }) {
    const asset = await this.prisma.digitalAsset.findFirst({ where: { id, tenantId } });
    if (!asset) throw new NotFoundException('Activo no encontrado para este tenant');

    if (body.productId) {
      const product = await this.prisma.product.findFirst({ where: { id: body.productId, tenantId } });
      if (!product) throw new NotFoundException('Producto no encontrado para este tenant');
    }

    return this.prisma.digitalAsset.update({ where: { id }, data: body });
  }

  async remove(tenantId: string, id: string) {
    const asset = await this.prisma.digitalAsset.findFirst({ where: { id, tenantId } });
    if (!asset) throw new NotFoundException('Activo no encontrado para este tenant');

    return this.prisma.digitalAsset.delete({ where: { id } });
  }

  private async createWithValidatedProduct(tenantId: string, body: { name: string; type: string; sizeBytes: number; productId?: string; channel?: string }) {
    const product = await this.prisma.product.findFirst({ where: { id: body.productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado para este tenant');
    return this.prisma.digitalAsset.create({ data: { tenantId, ...body } });
  }
}
