import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPipelineOrThrow(pipelineId: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id: pipelineId, deletedAt: null },
      select: { id: true, workspaceId: true },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  async listForPipeline(pipelineId: string) {
    return this.prisma.stage.findMany({
      where: { pipelineId, deletedAt: null },
      select: {
        id: true,
        pipelineId: true,
        name: true,
        position: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { position: 'asc' },
    });
  }

  async createForPipeline(pipelineId: string, name: string, color?: string) {
    const max = await this.prisma.stage.aggregate({
      where: { pipelineId, deletedAt: null },
      _max: { position: true },
    });

    const nextPos = (max._max.position ?? 0) + 1;

    return this.prisma.stage.create({
      data: { pipelineId, name, color, position: nextPos },
      select: {
        id: true,
        pipelineId: true,
        name: true,
        position: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async reorder(pipelineId: string, items: { stageId: string; position: number }[]) {
    if (items.length === 0) {
      throw new BadRequestException('items must not be empty');
    }

    // ensure no duplicate positions
    const positions = items.map((i) => i.position);
    const posSet = new Set(positions);
    if (posSet.size !== positions.length) {
      throw new BadRequestException('Duplicate positions in reorder payload');
    }

    // load stages to ensure all belong to pipeline
    const stages = await this.prisma.stage.findMany({
      where: { pipelineId, deletedAt: null, id: { in: items.map((i) => i.stageId) } },
      select: { id: true },
    });

    if (stages.length !== items.length) {
      throw new BadRequestException('Some stageIds are invalid or do not belong to this pipeline');
    }

    // Two-pass update to avoid @@unique(pipelineId, position) collisions:
    // 1) move each stage to a unique temporary negative position
    // 2) move to final position
    return this.prisma.$transaction(async (tx) => {
      for (const it of items) {
        await tx.stage.update({
          where: { id: it.stageId },
          data: { position: -it.position }, // temporary unique
        });
      }

      for (const it of items) {
        await tx.stage.update({
          where: { id: it.stageId },
          data: { position: it.position },
        });
      }

      return tx.stage.findMany({
        where: { pipelineId, deletedAt: null },
        select: { id: true, name: true, position: true, color: true },
        orderBy: { position: 'asc' },
      });
    });
  }
}
