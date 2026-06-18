import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { AttributesService } from './attributes.service';

@ApiTags('attributes')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttributesController {
  constructor(private readonly service: AttributesService) {}

  @Get('attributes')
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post('attributes')
  create(@TenantId() tenantId: string, @Body() body: { code: string; name: string; type: string; groupId?: string; channels?: string[] }) {
    return this.service.create(tenantId, body);
  }

  @Get('attribute-groups')
  groups(@TenantId() tenantId: string) {
    return this.service.groups(tenantId);
  }
}
