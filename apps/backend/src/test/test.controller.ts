import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user/current-user.decorator';
import { WorkspaceAccessService } from '../workspace-access/workspace-access.service';
import { WorkspaceRole } from '@prisma/client';

@ApiTags('Test')
@ApiHeader({ name: 'x-user-id', required: true })
@UseGuards(JwtAuthGuard)
@Controller('test')
export class TestController {
  constructor(private readonly access: WorkspaceAccessService) {}

  @Get('workspace/:workspaceId/member')
  async isMember(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const membership = await this.access.assertMember(user.userId, workspaceId);
    return { ok: true, role: membership.role };
  }

  @Get('workspace/:workspaceId/admin')
  async isAdmin(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const membership = await this.access.assertRole(user.userId, workspaceId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);
    return { ok: true, role: membership.role };
  }
}
