import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { TestController } from './test/test.controller';
import { TestModule } from './test/test.module';
import { WorkspaceAccessModule } from './workspace-access/workspace-access.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    TestModule,
    WorkspaceAccessModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
