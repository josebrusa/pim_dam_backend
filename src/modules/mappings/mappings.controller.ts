import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { MappingsService } from './mappings.service';

@ApiTags('mappings')
@Controller('mappings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MappingsController {
  constructor(private readonly service: MappingsService) {}

  @Get()
  list(@TenantId() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post('rules')
  createRule(@TenantId() tenantId: string, @Body() body: { profileId?: string; name: string; sourceField: string; targetField: string; transform?: string }) {
    return this.service.createRule(tenantId, body);
  }

  @Post('test')
  test(@Body() body: { sourceField: string; targetField: string; value: string; transform?: string }) {
    return this.service.test(body);
  }
}
