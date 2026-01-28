import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user/current-user.decorator';

import { WorkspaceAccessService } from '../workspace-access/workspace-access.service';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(
    private readonly tasks: TasksService,
    private readonly access: WorkspaceAccessService,
  ) {}

  @Get('workspaces/:workspaceId/tasks')
  @ApiParam({ name: 'workspaceId' })
  @ApiQuery({ name: 'dueBefore', required: false })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  async list(
    @Param('workspaceId') workspaceId: string,
    @Query('dueBefore') dueBefore: string | undefined,
    @Query('status') status: TaskStatus | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.access.assertMember(user.userId, workspaceId);

    return this.tasks.listForWorkspace({
      workspaceId,
      dueBefore: dueBefore ? new Date(dueBefore) : undefined,
      status,
    });
  }

    @Get('applications/:applicationId/tasks')
    @ApiParam({ name: 'applicationId' })
    @ApiOkResponse({ description: 'List tasks for an application (member required)' })
    async listForApplication(
      @Param('applicationId') applicationId: string,
      @CurrentUser() user: CurrentUserPayload,
    ) {
      const workspaceId =
        await this.tasks.getWorkspaceIdByApplicationId(applicationId);

      await this.access.assertMember(user.userId, workspaceId);

      return this.tasks.listForApplication(applicationId);
  }


  @Post('applications/:applicationId/tasks')
  @ApiParam({ name: 'applicationId' })
  @ApiOkResponse({ description: 'Create task for an application (member required)' })
  async create(
    @Param('applicationId') applicationId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const workspaceId = await this.tasks.getWorkspaceIdByApplicationId(applicationId);
    await this.access.assertMember(user.userId, workspaceId);

    return this.tasks.createForApplication({
      workspaceId,
      applicationId,
      title: dto.title,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
    });
  }



  @Patch('tasks/:taskId')
  @ApiParam({ name: 'taskId' })
  async update(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(taskId, {
      title: dto.title,
      status: dto.status,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
    });
  }
}
