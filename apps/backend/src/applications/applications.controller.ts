import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { DevAuthGuard } from '../auth/dev-auth/dev-auth.guard';
import { CurrentUser } from '../auth/current-user/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user/current-user.decorator';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ListApplicationsQuery } from './dto/list-application.query';

@ApiTags('Applications')
@ApiHeader({ name: 'x-user-id', required: true })
@UseGuards(DevAuthGuard)
@Controller()
export class ApplicationsController {
  constructor(
    private readonly apps: ApplicationsService,
    private readonly access: WorkspaceAccessService,
  ) {}

  @Get('workspaces/:workspaceId/applications')
  @ApiParam({ name: 'workspaceId' })
  @ApiOkResponse({ description: 'List applications (workspace member required)' })
  async list(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: ListApplicationsQuery,
  ) {
    await this.access.assertMember(user.userId, workspaceId);
    return this.apps.list(workspaceId, query);
  }

  @Post('workspaces/:workspaceId/applications')
  @ApiParam({ name: 'workspaceId' })
  @ApiOkResponse({ description: 'Create application (workspace member required)' })
  async create(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateApplicationDto,
  ) {
    // Force workspaceId from route (don’t trust body)
    await this.access.assertMember(user.userId, workspaceId);

    return this.apps.create({
      userId: user.userId,
      workspaceId,
      pipelineId: dto.pipelineId,
      stageId: dto.stageId,
      company: dto.company,
      role: dto.role,
      link: dto.link,
      source: dto.source,
      location: dto.location,
      compMin: dto.compMin,
      compMax: dto.compMax,
      priority: dto.priority,
      status: dto.status,
      position: dto.position,
    });
  }

  @Patch('applications/:id')
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Update application (includes stage movement)' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateApplicationDto,
  ) {
    const existing = await this.apps.getOrThrow(id);
    await this.access.assertMember(user.userId, existing.workspaceId);
    return this.apps.update(id, user.userId, dto);
  }

  @Delete('applications/:id')
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Soft delete application' })
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    const existing = await this.apps.getOrThrow(id);
    await this.access.assertMember(user.userId, existing.workspaceId);
    return this.apps.softDelete(id);
  }
}
