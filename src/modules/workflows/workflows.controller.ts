import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser, TenantId, type AuthUser } from '../../shared/decorators/auth.decorator';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { WorkflowsService } from './workflows.service';

@ApiTags('workflows')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}

  @Get('workflows')
  list(@TenantId() tenantId: string, @Query() query: PaginationDto) {
    return this.service.list(tenantId, query.page, query.pageSize);
  }

  @Post('workflows')
  create(@TenantId() tenantId: string, @Body() body: { name: string }) {
    return this.service.create(tenantId, body);
  }

  @Get('workflow-tasks/my')
  myTasks(@TenantId() tenantId: string, @CurrentUser() user: AuthUser) {
    return this.service.myTasks(tenantId, user.userId);
  }

  @Patch('workflow-tasks/:id')
  updateTask(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: { status?: string; stage?: string }) {
    return this.service.updateTask(tenantId, id, body);
  }
}
