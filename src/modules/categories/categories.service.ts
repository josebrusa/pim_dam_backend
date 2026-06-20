import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { paginated } from '../../shared/dto/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, page = 1, pageSize = 50) {
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where: { tenantId },
        include: { parent: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { code: 'asc' },
      }),
      this.prisma.category.count({ where: { tenantId } }),
    ]);
    return paginated(data, total, page, pageSize);
  }

  async create(tenantId: string, body: { code: string; name: string; parentId?: string; level?: number }) {
    if (body.parentId) {
      const parent = await this.prisma.category.findFirst({ where: { id: body.parentId, tenantId } });
      if (!parent) throw new NotFoundException('Categoría padre no encontrada para este tenant');
    }
    return this.prisma.category.create({
      data: { tenantId, code: body.code, name: body.name, parentId: body.parentId, level: body.level ?? 0 },
    });
  }

  async update(tenantId: string, id: string, body: { name?: string; parentId?: string; level?: number }) {
    const category = await this.prisma.category.findFirst({ where: { id, tenantId } });
    if (!category) throw new NotFoundException('Categoría no encontrada para este tenant');

    if (body.parentId) {
      if (body.parentId === id) throw new NotFoundException('Una categoría no puede ser su propia categoría padre');

      const parent = await this.prisma.category.findFirst({ where: { id: body.parentId, tenantId } });
      if (!parent) throw new NotFoundException('Categoría padre no encontrada para este tenant');
    }

    return this.prisma.category.update({ where: { id }, data: body });
  }

  async remove(tenantId: string, id: string) {
    const category = await this.prisma.category.findFirst({ where: { id, tenantId } });
    if (!category) throw new NotFoundException('Categoría no encontrada para este tenant');

    return this.prisma.category.delete({ where: { id } });
  }

  async importTree(tenantId: string, body: { nodes: { code: string; name: string; parentCode?: string; level: number }[] }) {
    const created: string[] = [];
    const codeToId: Record<string, string> = {};
    for (const node of body.nodes.sort((a, b) => a.level - b.level)) {
      const parentId = node.parentCode ? codeToId[node.parentCode] : undefined;
      const cat = await this.prisma.category.upsert({
        where: { tenantId_code: { tenantId, code: node.code } },
        update: { name: node.name, level: node.level, parentId },
        create: { tenantId, code: node.code, name: node.name, level: node.level, parentId },
      });
      codeToId[node.code] = cat.id;
      created.push(cat.id);
    }
    return { imported: created.length };
  }
}
