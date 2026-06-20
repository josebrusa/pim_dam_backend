import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { paginated } from '../../shared/dto/pagination.dto';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, page = 1, pageSize = 20) {
    const workflows = await this.prisma.workflow.findMany({
      where: { tenantId },
      include: { tasks: true },
    });
    const stats = {
      active: workflows.filter((w) => w.status === 'active').length,
      pending: workflows.reduce((n, w) => n + w.tasks.filter((t) => t.status === 'pending').length, 0),
      completed: workflows.reduce((n, w) => n + w.tasks.filter((t) => t.status === 'completed').length, 0),
      blocked: workflows.reduce((n, w) => n + w.tasks.filter((t) => t.status === 'blocked').length, 0),
    };
    const [workflowData, workflowTotal, taskData, taskTotal] = await Promise.all([
      this.prisma.workflow.findMany({
        where: { tenantId },
        include: { _count: { select: { tasks: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.workflow.count({ where: { tenantId } }),
      this.prisma.workflowTask.findMany({
        where: { workflow: { tenantId } },
        include: { workflow: true, assignee: { select: { name: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.workflowTask.count({ where: { workflow: { tenantId } } }),
    ]);

    return {
      stats,
      workflows: paginated(workflowData, workflowTotal, page, pageSize),
      tasks: paginated(taskData, taskTotal, page, pageSize),
    };
  }

  create(tenantId: string, body: { name: string }) {
    return this.prisma.workflow.create({ data: { tenantId, name: body.name, status: 'active' } });
  }

  async update(tenantId: string, id: string, body: { name?: string; status?: string }) {
    const workflow = await this.prisma.workflow.findFirst({ where: { id, tenantId } });
    if (!workflow) throw new NotFoundException('Workflow no encontrado');
    return this.prisma.workflow.update({ where: { id }, data: body });
  }

  async remove(tenantId: string, id: string) {
    const workflow = await this.prisma.workflow.findFirst({ where: { id, tenantId } });
    if (!workflow) throw new NotFoundException('Workflow no encontrado');
    return this.prisma.workflow.delete({ where: { id } });
  }

  myTasks(tenantId: string, userId: string) {
    return this.prisma.workflowTask.findMany({
      where: { workflow: { tenantId }, OR: [{ assigneeId: userId }, { assigneeId: null }] },
      include: { workflow: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateTask(tenantId: string, id: string, body: { status?: string; stage?: string }) {
    const task = await this.prisma.workflowTask.findFirst({
      where: { id, workflow: { tenantId } },
    });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return this.prisma.workflowTask.update({ where: { id }, data: body });
  }
}
