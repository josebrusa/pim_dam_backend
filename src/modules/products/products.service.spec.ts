import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  it('rechaza categoryId de otro tenant al crear', async () => {
    const prisma = {
      category: { findFirst: jest.fn().mockResolvedValue(null) },
      product: { create: jest.fn() },
    } as any;
    const service = new ProductsService(prisma);

    await expect(service.create('tenant-a', { code: 'PRD-1', name: 'Producto', categoryId: 'cat-b' }))
      .rejects.toBeInstanceOf(NotFoundException);
  });
});
