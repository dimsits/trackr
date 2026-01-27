import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Me')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  @ApiOkResponse({ description: 'Returns the current user' })
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.prisma.user.findFirst({
      where: { id: user.userId, deletedAt: null },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }
}
