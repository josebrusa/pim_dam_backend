import { NotFoundException } from '@nestjs/common';
import { AssetsService } from './assets.service';

describe('AssetsService', () => {
  it('rechaza productId de otro tenant al crear', async () => {
    const prisma = {
      product: { findFirst: jest.fn().mockResolvedValue(null) },
      digitalAsset: { create: jest.fn() },
    } as any;
    const service = new AssetsService(prisma);

    await expect(service.create('tenant-a', { name: 'asset.jpg', type: 'image', sizeBytes: 10, productId: 'prod-b' }))
      .rejects.toBeInstanceOf(NotFoundException);
  });
});
