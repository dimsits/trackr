import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user/current-user.decorator';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service';
import { StagesService } from './stages.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { ReorderStagesDto } from './dto/reorder-stages.dto';

@ApiTags('Stages')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class StagesController {
  constructor(
    private readonly stages: StagesService,
    private readonly access: WorkspaceAccessService,
  ) {}

  @Get('pipelines/:pipelineId/stages')
  @ApiParam({ name: 'pipelineId' })
  @ApiOkResponse({ description: 'List stages for pipeline (member required via pipeline.workspaceId)' })
  async list(
    @Param('pipelineId') pipelineId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const pipeline = await this.stages.getPipelineOrThrow(pipelineId);
    await this.access.assertMember(user.userId, pipeline.workspaceId);
    return this.stages.listForPipeline(pipelineId);
  }

  @Post('pipelines/:pipelineId/stages')
  @ApiParam({ name: 'pipelineId' })
  @ApiOkResponse({ description: 'Create stage (member required via pipeline.workspaceId)' })
  async create(
    @Param('pipelineId') pipelineId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateStageDto,
  ) {
    const pipeline = await this.stages.getPipelineOrThrow(pipelineId);
    await this.access.assertMember(user.userId, pipeline.workspaceId);
    return this.stages.createForPipeline(pipelineId, dto.name, dto.color);
  }

  @Patch('pipelines/:pipelineId/stages/reorder')
  @ApiParam({ name: 'pipelineId' })
  @ApiOkResponse({ description: 'Reorder stages (transactional, member required)' })
  async reorder(
    @Param('pipelineId') pipelineId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ReorderStagesDto,
  ) {
    const pipeline = await this.stages.getPipelineOrThrow(pipelineId);
    await this.access.assertMember(user.userId, pipeline.workspaceId);
    return this.stages.reorder(pipelineId, dto.items);
  }
}
