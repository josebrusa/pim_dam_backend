import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { PermissionsGuard, RequirePermissions } from '../../shared/guards/permissions.guard';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './channel.dto';

@ApiTags('channels')
@Controller('channels')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ChannelsController {
  constructor(private readonly service: ChannelsService) {}

  @Get()
  @RequirePermissions('channels:read')
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post()
  @RequirePermissions('channels:write')
  create(@TenantId() tenantId: string, @Body() body: CreateChannelDto) {
    return this.service.create(tenantId, body);
  }

  @Post('sync-all')
  @RequirePermissions('channels:write')
  syncAll(@TenantId() tenantId: string) {
    return this.service.syncAll(tenantId);
  }
}
