import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { TenantId } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { PermissionsGuard, RequirePermissions } from '../../shared/guards/permissions.guard';
import { UsersService } from './users.service';
import { InviteUserDto } from './user.dto';

@ApiTags('users')
@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('users')
  @RequirePermissions('users:read')
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post('users/invitations')
  @RequirePermissions('users:invite')
  invite(@TenantId() tenantId: string, @Body() body: InviteUserDto) {
    return this.service.invite(tenantId, body);
  }

  @Get('roles')
  @RequirePermissions('users:read')
  roles() {
    return this.service.roles();
  }

  @Get('permissions')
  @RequirePermissions('users:read')
  permissions() {
    return this.service.permissions();
  }
}
