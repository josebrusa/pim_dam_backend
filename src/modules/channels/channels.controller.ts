import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { ChannelsService } from './channels.service';

@ApiTags('channels')
@Controller('channels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChannelsController {
  constructor(private readonly service: ChannelsService) {}

  @Get()
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() body: { name: string; connector: string }) {
    return this.service.create(tenantId, body);
  }

  @Post('sync-all')
  syncAll(@TenantId() tenantId: string) {
    return this.service.syncAll(tenantId);
  }
}
