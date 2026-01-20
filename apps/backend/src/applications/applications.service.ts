import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string, query: { pipelineId?: string; stageId?: string; q?: string }) {
    const q = query.q?.trim();
    return this.prisma.application.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        ...(query.pipelineId ? { pipelineId: query.pipelineId } : {}),
        ...(query.stageId ? { stageId: query.stageId } : {}),
        ...(q
          ? {
              OR: [
                { company: { contains: q, mode: 'insensitive' } },
                { role: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        workspaceId: true,
        pipelineId: true,
        stageId: true,
        company: true,
        role: true,
        link: true,
        source: true,
        location: true,
        compMin: true,
        compMax: true,
        priority: true,
        status: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ stageId: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async create(input: {
    userId: string;
    workspaceId: string;
    pipelineId: string;
    stageId: string;
    company: string;
    role: string;
    link?: string;
    source?: string;
    location?: string;
    compMin?: number;
    compMax?: number;
    priority?: any;
    status?: any;
    position?: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Validate pipeline belongs to workspace
      const pipeline = await tx.pipeline.findFirst({
        where: { id: input.pipelineId, workspaceId: input.workspaceId, deletedAt: null },
        select: { id: true },
      });
      if (!pipeline) throw new BadRequestException('pipelineId is invalid for this workspace');

      // Validate stage belongs to pipeline
      const stage = await tx.stage.findFirst({
        where: { id: input.stageId, pipelineId: input.pipelineId, deletedAt: null },
        select: { id: true },
      });
      if (!stage) throw new BadRequestException('stageId is invalid for this pipeline');

      // If position not provided, append to end of stage
      let position = input.position;
      if (position === undefined || position === null) {
        const max = await tx.application.aggregate({
          where: { stageId: input.stageId, deletedAt: null },
          _max: { position: true },
        });
        position = (max._max.position ?? -1) + 1;
      }

      // Make room in stage by shifting items at/after position
      await tx.application.updateMany({
        where: {
          stageId: input.stageId,
          deletedAt: null,
          position: { gte: position },
        },
        data: { position: { increment: 1 } },
      });

      const app = await tx.application.create({
        data: {
          workspaceId: input.workspaceId,
          pipelineId: input.pipelineId,
          stageId: input.stageId,
          company: input.company,
          role: input.role,
          link: input.link,
          source: input.source,
          location: input.location,
          compMin: input.compMin,
          compMax: input.compMax,
          priority: input.priority,
          status: input.status,
          position,
        },
        select: {
          id: true,
          workspaceId: true,
          pipelineId: true,
          stageId: true,
          company: true,
          role: true,
          position: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Optional: create a CREATED activity (not required by spec; safe to add later)
      // await tx.activity.create({ data: { applicationId: app.id, type: ActivityType.NOTE, content: 'Created', createdById: input.userId } });

      return app;
    });
  }

  async getOrThrow(applicationId: string) {
    const app = await this.prisma.application.findFirst({
      where: { id: applicationId, deletedAt: null },
      select: {
        id: true,
        workspaceId: true,
        pipelineId: true,
        stageId: true,
        position: true,
      },
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async update(applicationId: string, userId: string, patch: any) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.application.findFirst({
        where: { id: applicationId, deletedAt: null },
        select: {
          id: true,
          workspaceId: true,
          pipelineId: true,
          stageId: true,
          position: true,
        },
      });
      if (!existing) throw new NotFoundException('Application not found');

      const isMove = patch.stageId !== undefined || patch.position !== undefined;

      // Non-move fields update (always allowed)
      if (!isMove) {
        return tx.application.update({
          where: { id: applicationId },
          data: patch,
          select: {
            id: true,
            workspaceId: true,
            pipelineId: true,
            stageId: true,
            company: true,
            role: true,
            link: true,
            source: true,
            location: true,
            compMin: true,
            compMax: true,
            priority: true,
            status: true,
            position: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      }

      // MOVE LOGIC
      const fromStageId = existing.stageId;
      const toStageId = patch.stageId ?? existing.stageId;

      // Validate target stage belongs to same pipeline (and pipeline to workspace)
      const stage = await tx.stage.findFirst({
        where: { id: toStageId, deletedAt: null },
        select: { id: true, pipelineId: true },
      });
      if (!stage) throw new BadRequestException('stageId is invalid');

      if (stage.pipelineId !== existing.pipelineId) {
        throw new BadRequestException('Cannot move application to a stage in a different pipeline');
      }

      // Determine target position (append if not specified)
      let newPos: number;
      if (patch.position === undefined || patch.position === null) {
        const max = await tx.application.aggregate({
          where: { stageId: toStageId, deletedAt: null },
          _max: { position: true },
        });
        newPos = (max._max.position ?? -1) + 1;
      } else {
        newPos = patch.position;
      }

      // 1) Remove from old stage ordering (close the gap) if stage changed or position changed
      // Decrement positions after the old position in the from stage
      await tx.application.updateMany({
        where: {
          stageId: fromStageId,
          deletedAt: null,
          position: { gt: existing.position },
        },
        data: { position: { decrement: 1 } },
      });

      // 2) Make room in target stage at newPos
      await tx.application.updateMany({
        where: {
          stageId: toStageId,
          deletedAt: null,
          position: { gte: newPos },
        },
        data: { position: { increment: 1 } },
      });

      // 3) Update the application itself
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: {
          ...patch,
          stageId: toStageId,
          position: newPos,
        },
        select: {
          id: true,
          workspaceId: true,
          pipelineId: true,
          stageId: true,
          company: true,
          role: true,
          link: true,
          source: true,
          location: true,
          compMin: true,
          compMax: true,
          priority: true,
          status: true,
          position: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 4) Insert Activity event for stage move (required for drag/drop correctness)
      if (fromStageId !== toStageId) {
        await tx.activity.create({
          data: {
            applicationId: applicationId,
            type: ActivityType.STAGE_MOVED,
            content: null,
            data: { fromStageId, toStageId },
            createdById: userId,
          },
        });
      }

      return updated;
    });
  }

  async softDelete(applicationId: string) {
    // soft delete recommended in spec
    return this.prisma.application.update({
      where: { id: applicationId },
      data: { deletedAt: new Date() },
      select: { id: true, deletedAt: true },
    });
  }
}
