import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  list(@TenantId() tenantId: string, @Query() query: PaginationDto & { status?: string }) {
    return this.service.list(tenantId, query.page, query.pageSize, query.q, query.status);
  }

  @Get(':id')
  get(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() body: { code: string; name: string; categoryId?: string }) {
    return this.service.create(tenantId, body);
  }

  @Patch(':id')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: { name?: string; status?: string; categoryId?: string }) {
    return this.service.update(tenantId, id, body);
  }
}
