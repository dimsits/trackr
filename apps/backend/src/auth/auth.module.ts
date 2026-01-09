import { Module } from '@nestjs/common';
import { DevAuthGuard } from './dev-auth/dev-auth.guard';
import { AuthController } from './auth.controller';

@Module({
  providers: [DevAuthGuard],
  exports: [DevAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
