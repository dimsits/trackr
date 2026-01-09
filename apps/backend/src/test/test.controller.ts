import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { DevAuthGuard } from '../auth/dev-auth/dev-auth.guard';
import { CurrentUser } from '../auth/current-user/current-user.decorator';
import type { CurrentUserPayload } from '../auth/current-user/current-user.decorator';

@ApiTags('Test')
@Controller('test')
export class TestController {
  @Get()
  @UseGuards(DevAuthGuard)
  @ApiHeader({ name: 'x-user-id', required: true })
  findStuff(@CurrentUser() user: CurrentUserPayload) {
    return { userId: user.userId };
  }
}
