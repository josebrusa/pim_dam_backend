import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { GdsnService } from './gdsn.service';

@ApiTags('gdsn')
@Controller('gdsn')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GdsnController {
  constructor(private readonly service: GdsnService) {}

  @Get('publications')
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post('publications')
  create(@TenantId() tenantId: string, @Body() body: { gtin: string; productName: string; dataPool: string; recipient: string }) {
    return this.service.create(tenantId, body);
  }
}
