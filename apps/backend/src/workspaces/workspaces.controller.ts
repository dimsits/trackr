import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiParam, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user/current-user.decorator';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@ApiTags('Workspaces')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(
    private readonly workspaces: WorkspacesService,
    private readonly access: WorkspaceAccessService,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'List workspaces for current user' })
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.workspaces.listForUser(user.userId);
  }

  @Post()
  @ApiOkResponse({ description: 'Create workspace + OWNER membership' })
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspaces.createForUser(user.userId, dto.name);
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ description: 'Get a workspace (must be a member)' })
  async getOne(
    @Param('id') workspaceId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.access.assertMember(user.userId, workspaceId);
    return this.workspaces.getById(workspaceId);
  }
}
