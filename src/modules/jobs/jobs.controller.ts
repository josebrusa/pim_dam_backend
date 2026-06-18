import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { JobsService } from './jobs.service';

@ApiTags('import-export')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get('imports')
  listImports(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.listImports(tenantId, query.page, query.pageSize);
  }

  @Post('imports')
  createImport(@TenantId() tenantId: string, @Body() body: { type: string }) {
    return this.service.createImport(tenantId, body);
  }

  @Get('exports')
  listExports(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.listExports(tenantId, query.page, query.pageSize);
  }

  @Post('exports')
  createExport(@TenantId() tenantId: string, @Body() body: { type: string }) {
    return this.service.createExport(tenantId, body);
  }
}
