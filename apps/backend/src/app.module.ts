import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './config/env.validation';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { WorkspaceAccessModule } from './workspace-access/workspace-access.module';
import { ServiceModule } from './controller/service/service.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { StagesModule } from './stages/stages.module';
import { ApplicationsModule } from './applications/applications.module';
import { ActivitiesModule } from './activities/activities.module';
import { TasksModule } from './tasks/tasks.module';
import { FilesModule } from './files/files.module';
import { MeController } from './me/me.controller';

// Local-only test/debug endpoints
import { TestModule } from './test/test.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: validateEnv,
    }),

    PrismaModule,
    HealthModule,
    AuthModule,
    WorkspaceAccessModule,
    ServiceModule,
    WorkspacesModule,
    PipelinesModule,
    StagesModule,
    ApplicationsModule,
    ActivitiesModule,
    TasksModule,
    FilesModule,
    TestModule,
  ],
  controllers: [AppController, MeController],
  providers: [AppService],
})
export class AppModule {}
