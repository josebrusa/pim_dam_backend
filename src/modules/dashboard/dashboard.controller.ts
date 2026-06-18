import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  summary(@TenantId() tenantId: string) {
    return this.service.summary(tenantId);
  }

  @Get('activity')
  activity(@TenantId() tenantId: string) {
    return this.service.activity(tenantId);
  }

  @Get('products-by-channel')
  productsByChannel(@TenantId() tenantId: string) {
    return this.service.productsByChannel(tenantId);
  }
}
