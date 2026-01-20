import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_STAGE_NAMES = ['Interested', 'Applied', 'Interview', 'Offer', 'Rejected'];

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForWorkspace(workspaceId: string) {
    return this.prisma.pipeline.findMany({
      where: { workspaceId, deletedAt: null },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async createForWorkspace(opts: {
    workspaceId: string;
    name: string;
    isDefault?: boolean;
    createDefaultStages?: boolean;
  }) {
    const { workspaceId, name } = opts;
    const isDefault = opts.isDefault ?? false;
    const createDefaultStages = opts.createDefaultStages ?? true;

    return this.prisma.$transaction(async (tx) => {
      // if setting default, unset other defaults in workspace
      if (isDefault) {
        await tx.pipeline.updateMany({
          where: { workspaceId, deletedAt: null, isDefault: true },
          data: { isDefault: false },
        });
      }

      const pipeline = await tx.pipeline.create({
        data: {
          workspaceId,
          name,
          isDefault,
        },
        select: {
          id: true,
          workspaceId: true,
          name: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (createDefaultStages) {
        await tx.stage.createMany({
          data: DEFAULT_STAGE_NAMES.map((stageName, idx) => ({
            pipelineId: pipeline.id,
            name: stageName,
            position: idx + 1,
          })),
        });
      }

      return pipeline;
    });
  }

  async getById(pipelineId: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, deletedAt: null },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  async update(pipelineId: string, patch: { name?: string; isDefault?: boolean }) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.pipeline.findFirst({
        where: { id: pipelineId, deletedAt: null },
        select: { id: true, workspaceId: true },
      });
      if (!existing) throw new NotFoundException('Pipeline not found');

      if (patch.isDefault === true) {
        await tx.pipeline.updateMany({
          where: { workspaceId: existing.workspaceId, deletedAt: null, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.pipeline.update({
        where: { id: pipelineId },
        data: {
          name: patch.name,
          isDefault: patch.isDefault,
        },
        select: {
          id: true,
          workspaceId: true,
          name: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  }
}
