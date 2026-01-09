import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class DevAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();

    const userId = req.headers['x-user-id'];
    if (!userId || typeof userId !== 'string') {
      throw new UnauthorizedException('Missing x-user-id header');
    }

    // attach a "user" payload (same shape you’ll later use for JWT)
    req.user = { userId };

    return true;
  }
}
