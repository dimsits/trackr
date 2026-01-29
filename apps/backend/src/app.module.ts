import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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

// Dev-only
import { TestModule } from './test/test.module';
import { TestController } from './test/test.controller';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // In Render, env vars come from the dashboard (no .env file).
      // Locally, you can still use .env
      envFilePath: isProd ? undefined : ['.env'],
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

    // Only include test endpoints in non-prod
    ...(isProd ? [] : [TestModule]),
  ],
  controllers: [
    AppController,
    MeController,

    // Only include test controller in non-prod
    ...(isProd ? [] : [TestController]),
  ],
  providers: [AppService],
})
export class AppModule {}
