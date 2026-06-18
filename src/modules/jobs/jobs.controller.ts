import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { PermissionsGuard, RequirePermissions } from '../../shared/guards/permissions.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './jobs.dto';

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
}
