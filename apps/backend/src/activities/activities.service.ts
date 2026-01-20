import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async getApplicationOrThrow(applicationId: string) {
    const app = await this.prisma.application.findFirst({
      where: { id: applicationId, deletedAt: null },
      select: { id: true, workspaceId: true },
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async listForApplication(applicationId: string) {
    return this.prisma.activity.findMany({
      where: { applicationId },
      select: {
        id: true,
        applicationId: true,
        type: true,
        content: true,
        data: true,
        createdById: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createNote(opts: {
    applicationId: string;
    userId: string;
    content: string;
  }) {
    return this.prisma.activity.create({
      data: {
        applicationId: opts.applicationId,
        type: ActivityType.NOTE,
        content: opts.content,
        createdById: opts.userId,
      },
      select: {
        id: true,
        applicationId: true,
        type: true,
        content: true,
        data: true,
        createdById: true,
        createdAt: true,
      },
    });
  }
}
