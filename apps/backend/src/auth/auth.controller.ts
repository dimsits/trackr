import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { DevAuthGuard } from './dev-auth/dev-auth.guard';
import { CurrentUser } from './current-user/current-user.decorator';
import type { CurrentUserPayload } from './current-user/current-user.decorator';

@ApiTags('Auth')
@Controller()
export class AuthController {
  @Get('me')
  @UseGuards(DevAuthGuard)
  @ApiHeader({ name: 'x-user-id', required: true })
  me(@CurrentUser() user: CurrentUserPayload) {
    return user;
  }
}
