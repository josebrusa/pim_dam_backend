import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { paginated } from '../../shared/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, page = 1, pageSize = 20, q?: string, status?: string) {
    const where = {
      tenantId,
      ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { code: { contains: q, mode: 'insensitive' as const } }] } : {}),
      ...(status ? { status } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { code: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);
    return paginated(data, total, page, pageSize);
  }

  async get(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: { category: true, skus: true, attributes: { include: { attribute: true } } },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(tenantId: string, body: { code: string; name: string; categoryId?: string }) {
    return this.prisma.product.create({
      data: { tenantId, code: body.code, name: body.name, categoryId: body.categoryId, status: 'draft' },
    });
  }

  async update(tenantId: string, id: string, body: { name?: string; status?: string; categoryId?: string }) {
    await this.get(tenantId, id);
    return this.prisma.product.update({ where: { id }, data: body });
  }
}
