import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PermissionsGuard, RequirePermissions } from '../../shared/guards/permissions.guard';
import { ProductsService } from './products.service';
import { CreateProductDto, ProductListDto, UpdateProductDto } from './product.dto';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @RequirePermissions('products:read')
  list(@TenantId() tenantId: string, @Query() query: ProductListDto) {
    return this.service.list(tenantId, query.page, query.pageSize, query.q, query.status);
  }

  @Get(':id')
  @RequirePermissions('products:read')
  get(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Post()
  @RequirePermissions('products:write')
  create(@TenantId() tenantId: string, @Body() body: CreateProductDto) {
    return this.service.create(tenantId, body);
  }

  @Patch(':id')
  @RequirePermissions('products:write')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.service.update(tenantId, id, body);
  }
}
