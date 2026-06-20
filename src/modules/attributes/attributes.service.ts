import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { paginated } from '../../shared/dto/pagination.dto';

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, page = 1, pageSize = 20) {
    const [data, total] = await Promise.all([
      this.prisma.attribute.findMany({
        where: { tenantId },
        include: { group: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { code: 'asc' },
      }),
      this.prisma.attribute.count({ where: { tenantId } }),
    ]);
    return paginated(data, total, page, pageSize);
  }

  async create(tenantId: string, body: { code: string; name: string; type: string; groupId?: string; channels?: string[] }) {
    if (body.groupId) {
      const group = await this.prisma.attributeGroup.findFirst({ where: { id: body.groupId, tenantId } });
      if (!group) throw new NotFoundException('Grupo de atributos no encontrado para este tenant');
    }
    return this.prisma.attribute.create({
      data: { tenantId, code: body.code, name: body.name, type: body.type, groupId: body.groupId, channels: body.channels ?? [], status: 'draft' },
    });
  }

  async update(tenantId: string, id: string, body: { name?: string; type?: string; status?: string; groupId?: string; channels?: string[] }) {
    const attribute = await this.prisma.attribute.findFirst({ where: { id, tenantId } });
    if (!attribute) throw new NotFoundException('Atributo no encontrado para este tenant');

    if (body.groupId) {
      const group = await this.prisma.attributeGroup.findFirst({ where: { id: body.groupId, tenantId } });
      if (!group) throw new NotFoundException('Grupo de atributos no encontrado para este tenant');
    }

    return this.prisma.attribute.update({
      where: { id },
      data: body,
    });
  }

  async remove(tenantId: string, id: string) {
    const attribute = await this.prisma.attribute.findFirst({ where: { id, tenantId } });
    if (!attribute) throw new NotFoundException('Atributo no encontrado para este tenant');

    return this.prisma.attribute.delete({ where: { id } });
  }

  async groups(tenantId: string) {
    return this.prisma.attributeGroup.findMany({ where: { tenantId } });
  }
}
