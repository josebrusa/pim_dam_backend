import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { PermissionsGuard, RequirePermissions } from '../../shared/guards/permissions.guard';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto } from './asset.dto';

@ApiTags('assets')
@Controller('assets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Get()
  @RequirePermissions('dam:read')
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post()
  @RequirePermissions('dam:write')
  create(@TenantId() tenantId: string, @Body() body: CreateAssetDto) {
    return this.service.create(tenantId, body);
  }

  @Patch(':id')
  @RequirePermissions('dam:write')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: UpdateAssetDto) {
    return this.service.update(tenantId, id, body);
  }

  @Delete(':id')
  @RequirePermissions('dam:write')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}
