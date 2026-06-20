import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { PermissionsGuard, RequirePermissions } from '../../shared/guards/permissions.guard';
import { GdsnService } from './gdsn.service';
import { CreateGdsnPublicationDto, UpdateGdsnPublicationDto } from './gdsn.dto';

@ApiTags('gdsn')
@Controller('gdsn')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class GdsnController {
  constructor(private readonly service: GdsnService) {}

  @Get('publications')
  @RequirePermissions('gdsn:read')
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post('publications')
  @RequirePermissions('gdsn:write')
  create(@TenantId() tenantId: string, @Body() body: CreateGdsnPublicationDto) {
    return this.service.create(tenantId, body);
  }

  @Patch('publications/:id')
  @RequirePermissions('gdsn:write')
  update(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: UpdateGdsnPublicationDto) {
    return this.service.update(tenantId, id, body);
  }

  @Delete('publications/:id')
  @RequirePermissions('gdsn:write')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}
