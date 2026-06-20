import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL ?? '';
    const pool = new Pool({ connectionString });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      console.warn('[Prisma] DATABASE_URL not set');
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
