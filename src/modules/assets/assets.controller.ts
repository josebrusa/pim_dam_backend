import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { AssetsService } from './assets.service';

@ApiTags('assets')
@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Get()
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() body: { name: string; type: string; sizeBytes: number; productId?: string; channel?: string }) {
    return this.service.create(tenantId, body);
  }
}
