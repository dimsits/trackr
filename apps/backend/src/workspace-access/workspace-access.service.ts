import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceRole } from '@prisma/client';

@Injectable()
export class WorkspaceAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ensures the workspace exists (not soft-deleted) and the user is a member.
   * Returns the Membership row (role is often useful downstream).
   */
  async assertMember(userId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, deletedAt: null },
      select: { id: true },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        workspaceId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        role: true,
        workspaceId: true,
        userId: true,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this workspace');
    }

    return membership;
  }

  /**
   * Ensures the user is a member and has one of the required roles.
   */
  async assertRole(
    userId: string,
    workspaceId: string,
    allowedRoles: WorkspaceRole[],
  ) {
    const membership = await this.assertMember(userId, workspaceId);

    if (!allowedRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient role for this workspace');
    }

    return membership;
  }
}
