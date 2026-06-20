import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { PermissionsGuard, RequirePermissions } from '../../shared/guards/permissions.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, ImportCategoryTreeDto, UpdateCategoryDto } from './category.dto';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  @RequirePermissions('categories:read')
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post()
  @RequirePermissions('categories:write')
  create(@TenantId() tenantId: string, @Body() body: CreateCategoryDto) {
    return this.service.create(tenantId, body);
  }

  @Patch(':id')
  @RequirePermissions('categories:write')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.service.update(tenantId, id, body);
  }

  @Delete(':id')
  @RequirePermissions('categories:write')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }

  @Post('import-tree')
  @RequirePermissions('categories:write')
  importTree(@TenantId() tenantId: string, @Body() body: ImportCategoryTreeDto) {
    return this.service.importTree(tenantId, body);
  }
}
