import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
    } catch {
      console.warn(
        '[Prisma] Database not available — API runs in bootstrap mode without DB',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
