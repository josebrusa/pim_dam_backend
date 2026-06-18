import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser, TenantId, type AuthUser } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { PermissionsGuard, RequirePermissions } from '../../shared/guards/permissions.guard';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowTaskDto } from './workflow.dto';

@ApiTags('workflows')
@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}

  @Get('workflows')
  @RequirePermissions('workflows:read')
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post('workflows')
  @RequirePermissions('workflows:write')
  create(@TenantId() tenantId: string, @Body() body: CreateWorkflowDto) {
    return this.service.create(tenantId, body);
  }

  @Get('workflow-tasks/my')
  @RequirePermissions('workflows:read')
  myTasks(@TenantId() tenantId: string, @CurrentUser() user: AuthUser) {
    return this.service.myTasks(tenantId, user.userId);
  }

  @Patch('workflow-tasks/:id')
  @RequirePermissions('workflows:write')
  updateTask(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: UpdateWorkflowTaskDto) {
    return this.service.updateTask(tenantId, id, body);
  }
}
