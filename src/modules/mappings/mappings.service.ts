import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class MappingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.mappingProfile.findMany({
      where: { tenantId },
      include: { rules: true },
    });
  }

  async createRule(tenantId: string, body: { profileId?: string; name: string; sourceField: string; targetField: string; transform?: string }) {
    let profileId = body.profileId;
    if (!profileId) {
      const profile = await this.prisma.mappingProfile.findFirst({ where: { tenantId } });
      profileId = profile?.id ?? (await this.prisma.mappingProfile.create({
        data: { tenantId, name: 'Default', source: 'external', target: 'lumify' },
      })).id;
    }
    return this.prisma.mappingRule.create({
      data: { profileId, name: body.name, sourceField: body.sourceField, targetField: body.targetField, transform: body.transform },
    });
  }

  test(body: { sourceField: string; targetField: string; value: string; transform?: string }) {
    let result = body.value;
    if (body.transform === 'strip_html') result = body.value.replace(/<[^>]*>/g, '');
    if (body.transform === 'uppercase') result = body.value.toUpperCase();
    return { sourceField: body.sourceField, targetField: body.targetField, input: body.value, output: result, success: true };
  }
}
