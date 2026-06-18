import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(tenantId: string, q: string) {
    if (!q?.trim()) return { products: [], attributes: [] };
    const [products, attributes] = await Promise.all([
      this.prisma.product.findMany({
        where: { tenantId, OR: [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }] },
        take: 10,
      }),
      this.prisma.attribute.findMany({
        where: { tenantId, OR: [{ name: { contains: q, mode: 'insensitive' } }, { code: { contains: q, mode: 'insensitive' } }] },
        take: 10,
      }),
    ]);
    return { products, attributes };
  }
}
