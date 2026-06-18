import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('users')
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post('users/invitations')
  invite(@TenantId() tenantId: string, @Body() body: { email: string; roleCode: string }) {
    return this.service.invite(tenantId, body);
  }

  @Get('roles')
  roles() {
    return this.service.roles();
  }

  @Get('permissions')
  permissions() {
    return this.service.permissions();
  }
}
