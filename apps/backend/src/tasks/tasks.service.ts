import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkspaceIdByApplicationId(applicationId: string): Promise<string> {
    const app = await this.prisma.application.findFirst({
      where: { id: applicationId, deletedAt: null },
      select: { workspaceId: true },
    });

    if (!app) throw new NotFoundException('Application not found');
    return app.workspaceId;
  }

  async listForWorkspace(opts: {
    workspaceId: string;
    dueBefore?: Date;
    status?: TaskStatus;
  }) {
    return this.prisma.task.findMany({
      where: {
        workspaceId: opts.workspaceId,
        deletedAt: null,
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.dueBefore ? { dueAt: { lte: opts.dueBefore } } : {}),
      },
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createForApplication(opts: {
    workspaceId: string;
    applicationId: string;
    title: string;
    dueAt?: Date;
  }) {
    return this.prisma.task.create({
      data: {
        workspaceId: opts.workspaceId,
        applicationId: opts.applicationId,
        title: opts.title,
        dueAt: opts.dueAt,
      },
    });
  }

  async update(taskId: string, patch: { title?: string; dueAt?: Date | null; status?: TaskStatus }) {
    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id: taskId },
      data: patch,
    });
  }
}
