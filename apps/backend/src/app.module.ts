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
import { ServiceModule } from './controller/service/service.module';
import { WorkspacesController } from './workspaces/workspaces.controller';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { StagesModule } from './stages/stages.module';
import { ApplicationsModule } from './applications/applications.module';
import { ActivitiesModule } from './activities/activities.module';
import { TasksModule } from './tasks/tasks.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    TestModule,
    WorkspaceAccessModule,
    ServiceModule,
    WorkspacesModule,
    PipelinesModule,
    StagesModule,
    ApplicationsModule,
    ActivitiesModule,
    TasksModule,
    FilesModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}
