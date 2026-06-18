import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { paginated } from '../../shared/dto/pagination.dto';

@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, page = 1, pageSize = 20) {
    const [data, total] = await Promise.all([
      this.prisma.channel.findMany({ where: { tenantId }, skip: (page - 1) * pageSize, take: pageSize, orderBy: { name: 'asc' } }),
      this.prisma.channel.count({ where: { tenantId } }),
    ]);
    return paginated(data, total, page, pageSize);
  }

  create(tenantId: string, body: { name: string; connector: string }) {
    return this.prisma.channel.create({ data: { tenantId, name: body.name, connector: body.connector, status: 'pending' } });
  }

  async syncAll(tenantId: string) {
    await this.prisma.channel.updateMany({
      where: { tenantId },
      data: { lastSyncAt: new Date(), status: 'connected' },
    });
    return { synced: true, at: new Date() };
  }
}
