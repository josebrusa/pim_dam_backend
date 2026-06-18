import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MappingsModule } from './modules/mappings/mappings.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { GdsnModule } from './modules/gdsn/gdsn.module';
import { AssetsModule } from './modules/assets/assets.module';
import { UsersModule } from './modules/users/users.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    DashboardModule,
    AttributesModule,
    ProductsModule,
    CategoriesModule,
    JobsModule,
    MappingsModule,
    WorkflowsModule,
    ChannelsModule,
    GdsnModule,
    AssetsModule,
    UsersModule,
    SearchModule,
  ],
})
export class AppModule {}
