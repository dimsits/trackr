import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { DevAuthGuard } from '../auth/dev-auth/dev-auth.guard';
import { CurrentUser } from '../auth/current-user/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user/current-user.decorator';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@ApiTags('Activities')
@ApiHeader({ name: 'x-user-id', required: true })
@UseGuards(DevAuthGuard)
@Controller()
export class ActivitiesController {
  constructor(
    private readonly activities: ActivitiesService,
    private readonly access: WorkspaceAccessService,
  ) {}

  @Get('applications/:applicationId/activities')
  @ApiParam({ name: 'applicationId' })
  @ApiOkResponse({ description: 'List activities for an application' })
  async list(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const app = await this.activities.getApplicationOrThrow(applicationId);
    await this.access.assertMember(user.userId, app.workspaceId);
    return this.activities.listForApplication(applicationId);
  }

  @Post('applications/:applicationId/activities')
  @ApiParam({ name: 'applicationId' })
  @ApiOkResponse({ description: 'Create NOTE activity' })
  async create(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateActivityDto,
  ) {
    const app = await this.activities.getApplicationOrThrow(applicationId);
    await this.access.assertMember(user.userId, app.workspaceId);

    return this.activities.createNote({
      applicationId,
      userId: user.userId,
      content: dto.content,
    });
  }
}
