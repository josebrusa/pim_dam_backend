import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PermissionsGuard, RequirePermissions } from '../../shared/guards/permissions.guard';
import { MappingsService } from './mappings.service';
import { CreateMappingRuleDto, TestMappingDto, UpdateMappingRuleDto } from './mapping.dto';

@ApiTags('mappings')
@Controller('mappings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class MappingsController {
  constructor(private readonly service: MappingsService) {}

  @Get()
  @RequirePermissions('mappings:read')
  list(@TenantId() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post('rules')
  @RequirePermissions('mappings:write')
  createRule(@TenantId() tenantId: string, @Body() body: CreateMappingRuleDto) {
    return this.service.createRule(tenantId, body);
  }

  @Patch('rules/:id')
  @RequirePermissions('mappings:write')
  updateRule(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: UpdateMappingRuleDto) {
    return this.service.updateRule(tenantId, id, body);
  }

  @Delete('rules/:id')
  @RequirePermissions('mappings:write')
  removeRule(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.service.removeRule(tenantId, id);
  }

  @Post('test')
  @RequirePermissions('mappings:write')
  test(@Body() body: TestMappingDto) {
    return this.service.test(body);
  }
}
