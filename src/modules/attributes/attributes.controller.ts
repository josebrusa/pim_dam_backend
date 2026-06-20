import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { PermissionsGuard, RequirePermissions } from '../../shared/guards/permissions.guard';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto, UpdateAttributeDto } from './attribute.dto';

@ApiTags('attributes')
@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AttributesController {
  constructor(private readonly service: AttributesService) {}

  @Get('attributes')
  @RequirePermissions('attributes:read')
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post('attributes')
  @RequirePermissions('attributes:write')
  create(@TenantId() tenantId: string, @Body() body: CreateAttributeDto) {
    return this.service.create(tenantId, body);
  }

  @Patch('attributes/:id')
  @RequirePermissions('attributes:write')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: UpdateAttributeDto) {
    return this.service.update(tenantId, id, body);
  }

  @Delete('attributes/:id')
  @RequirePermissions('attributes:write')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }

  @Get('attribute-groups')
  @RequirePermissions('attributes:read')
  groups(@TenantId() tenantId: string) {
    return this.service.groups(tenantId);
  }
}
