import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user/current-user.decorator';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';

@ApiTags('Pipelines')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class PipelinesController {
  constructor(
    private readonly pipelines: PipelinesService,
    private readonly access: WorkspaceAccessService,
  ) {}

  @Get('workspaces/:workspaceId/pipelines')
  @ApiParam({ name: 'workspaceId' })
  @ApiOkResponse({ description: 'List pipelines for a workspace (member required)' })
  async list(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.access.assertMember(user.userId, workspaceId);
    return this.pipelines.listForWorkspace(workspaceId);
  }

  @Post('workspaces/:workspaceId/pipelines')
  @ApiParam({ name: 'workspaceId' })
  @ApiOkResponse({ description: 'Create pipeline (member required)' })
  async create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePipelineDto,
  ) {
    await this.access.assertMember(user.userId, workspaceId);
    return this.pipelines.createForWorkspace({
      workspaceId,
      name: dto.name,
      isDefault: dto.isDefault,
      createDefaultStages: dto.createDefaultStages,
    });
  }

  @Patch('pipelines/:pipelineId')
  @ApiParam({ name: 'pipelineId' })
  @ApiOkResponse({ description: 'Update pipeline name/isDefault (member required)' })
  async update(
    @Param('pipelineId') pipelineId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdatePipelineDto,
  ) {
    const pipeline = await this.pipelines.getById(pipelineId);
    await this.access.assertMember(user.userId, pipeline.workspaceId);
    return this.pipelines.update(pipelineId, dto);
  }
}
