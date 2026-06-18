import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() body: { code: string; name: string; parentId?: string; level?: number }) {
    return this.service.create(tenantId, body);
  }

  @Post('import-tree')
  importTree(@TenantId() tenantId: string, @Body() body: { nodes: { code: string; name: string; parentCode?: string; level: number }[] }) {
    return this.service.importTree(tenantId, body);
  }
}
