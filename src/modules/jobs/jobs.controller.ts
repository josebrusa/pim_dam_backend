import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { PermissionsGuard, RequirePermissions } from '../../shared/guards/permissions.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './jobs.dto';

@ApiTags('import-export')
@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get('imports')
  @RequirePermissions('imports:read')
  listImports(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.listImports(tenantId, query.page, query.pageSize);
  }

  @Post('imports')
  @RequirePermissions('imports:write')
  createImport(@TenantId() tenantId: string, @Body() body: CreateJobDto) {
    return this.service.createImport(tenantId, body);
  }

  @Patch('imports/:id')
  @RequirePermissions('imports:write')
  updateImport(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: UpdateJobDto) {
    return this.service.updateImport(tenantId, id, body);
  }

  @Delete('imports/:id')
  @RequirePermissions('imports:write')
  removeImport(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.removeImport(tenantId, id);
  }

  @Get('exports')
  @RequirePermissions('imports:read')
  listExports(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.listExports(tenantId, query.page, query.pageSize);
  }

  @Post('exports')
  @RequirePermissions('imports:write')
  createExport(@TenantId() tenantId: string, @Body() body: CreateJobDto) {
    return this.service.createExport(tenantId, body);
  }

  @Patch('exports/:id')
  @RequirePermissions('imports:write')
  updateExport(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: UpdateJobDto) {
    return this.service.updateExport(tenantId, id, body);
  }

  @Delete('exports/:id')
  @RequirePermissions('imports:write')
  removeExport(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.removeExport(tenantId, id);
  }
}
