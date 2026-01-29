# Project File Structure

```
trackr/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── api-docu.md
├── apps/
│   ├── frontend/
│   │   ├── FRONTEND_STRUCTURE.md
│   │   ├── dev-pipeline.MD
│   │   ├── eslint.config.mjs
│   │   ├── next-env.d.ts
│   │   ├── next.config.ts
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── postcss.config.mjs
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── public/
│   │   │   ├── file.svg
│   │   │   ├── globe.svg
│   │   │   ├── next.svg
│   │   │   ├── vercel.svg
│   │   │   └── window.svg
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── queryClient.ts
│   │   ├── hooks/
│   │   │   ├── useActivities.ts
│   │   │   ├── useApplications.ts
│   │   │   ├── useCreateActivity.ts
│   │   │   ├── useCreateApplication.ts
│   │   │   ├── useCreatePipeline.ts
│   │   │   ├── useCreateTask.ts
│   │   │   ├── useCreateWorkspace.ts
│   │   │   ├── useDeleteApplication.ts
│   │   │   ├── useDownloadFile.ts
│   │   │   ├── useFiles.ts
│   │   │   ├── useMe.ts
│   │   │   ├── useMoveApplication.ts
│   │   │   ├── usePipelines.ts
│   │   │   ├── useRegister.ts
│   │   │   ├── useStages.ts
│   │   │   ├── useTasks.ts
│   │   │   ├── useUpdateApplication.ts
│   │   │   ├── useUpdateTask.ts
│   │   │   ├── useUploadFile.ts
│   │   │   ├── useWorkspaces.ts
│   │   │   └── useLogout.ts
│   │   ├── components/
│   │   │   ├── AuthGate.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── forms/
│   │   │   │   └── CreatePipelineForm.tsx
│   │   │   ├── ui/
│   │   │   │   └── Modal.tsx
│   │   │   ├── board/
│   │   │   │   ├── Board.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Column.tsx
│   │   │   │   └── types.ts
│   │   │   └── application/
│   │   │       ├── ActivitiesSection.tsx
│   │   │       ├── ApplicationDrawer.tsx
│   │   │       ├── DrawerSection.tsx
│   │   │       ├── DrawerShell.tsx
│   │   │       ├── EditApplication.tsx
│   │   │       ├── FileSection.tsx
│   │   │       ├── SectionBoundary.tsx
│   │   │       └── TasksSection.tsx
│   │   └── app/
│   │       ├── favicon.ico
│   │       ├── globals.css
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── providers.tsx
│   │       ├── (auth)/
│   │       │   ├── login/
│   │       │   │   └── page.tsx
│   │       │   └── register/
│   │       │       └── page.tsx
│   │       └── (app)/
│   │           ├── layout.tsx
│   │           └── workspaces/
│   │               ├── page.tsx
│   │               └── [workspaceId]/
│   │                   └── page.tsx
│   └── backend/
│       ├── .gitignore
│       ├── .prettierrc
│       ├── backend-architecture.md
│       ├── docker-compose.yml
│       ├── eslint.config.mjs
│       ├── nest-cli.json
│       ├── package-lock.json
│       ├── package.json
│       ├── prisma.config.ts
│       ├── README.md
│       ├── schema.md
│       ├── tsconfig.build.json
│       └── tsconfig.json
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── seed.ts
│       │   └── migrations/
│       │       ├── migration_lock.toml
│       │       ├── 20260108083049_init/
│       │       │   └── migration.sql
│       │       └── 20260109084525_full_schema/
│       │           └── migration.sql
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           ├── app.service.ts
│           ├── app.controller.ts
│           ├── app.controller.spec.ts
│           ├── auth/
│           │   ├── auth.controller.ts
│           │   ├── auth.controller.spec.ts
│           │   ├── auth.module.ts
│           │   ├── auth.service.ts
│           │   ├── auth.service.spec.ts
│           │   ├── jwt.strategy.ts
│           │   ├── jwt-auth.guard.ts
│           │   ├── dto/
│           │   │   ├── login.dto.ts
│           │   │   └── register.dto.ts
│           │   └── current-user/
│           │       └── current-user.decorator.ts
│           ├── applications/
│           │   ├── applications.module.ts
│           │   ├── applications.service.ts
│           │   ├── applications.service.spec.ts
│           │   ├── applications.controller.ts
│           │   ├── applications.controller.spec.ts
│           │   └── dto/
│           │       ├── create-application.dto.ts
│           │       ├── list-application.query.ts
│           │       └── update-application.dto.ts
│           ├── activities/
│           │   ├── activities.module.ts
│           │   ├── activities.service.ts
│           │   ├── activities.service.spec.ts
│           │   ├── activities.controller.ts
│           │   ├── activities.controller.spec.ts
│           │   └── dto/
│           │       └── create-activity.dto.ts
│           ├── pipelines/
│           │   ├── pipelines.module.ts
│           │   ├── pipelines.service.ts
│           │   ├── pipelines.service.spec.ts
│           │   ├── pipelines.controller.ts
│           │   └── pipelines.controller.spec.ts
│           ├── files/
│           │   ├── files.module.ts
│           │   ├── files.service.ts
│           │   ├── files.service.spec.ts
│           │   ├── files.controller.ts
│           │   ├── files.controller.spec.ts
│           │   └── dto/
│           │       ├── create-upload-url.dto.ts
│           │       └── register-file.dto.ts
│           ├── prisma/
│           │   ├── prisma.module.ts
│           │   └── prisma.service.ts
│           ├── workspaces/
│           │   ├── workspaces.module.ts
│           │   ├── workspaces.service.ts
│           │   ├── workspaces.service.spec.ts
│           │   ├── workspaces.controller.ts
│           │   └── workspaces.controller.spec.ts
│           ├── workspace-access/
│           │   ├── workspace-access.module.ts
│           │   ├── workspace-access.service.ts
│           │   └── workspace-access.service.spec.ts
│           ├── tasks/
│           │   ├── tasks.module.ts
│           │   ├── tasks.service.ts
│           │   ├── tasks.service.spec.ts
│           │   ├── tasks.controller.ts
│           │   ├── tasks.controller.spec.ts
│           │   └── dto/
│           │       ├── create-task.dto.ts
│           │       └── update-task.dto.ts
│           ├── stages/
│           │   ├── stages.module.ts
│           │   ├── stages.service.ts
│           │   ├── stages.service.spec.ts
│           │   ├── stages.controller.ts
│           │   ├── stages.controller.spec.ts
│           │   └── dto/
│           │       ├── create-stage.dto.ts
│           │       └── reorder-stages.dto.ts
│           ├── health/
│           │   ├── health.module.ts
│           │   ├── health.controller.ts
│           │   └── health.controller.spec.ts
│           └── test/
│               ├── test.module.ts
│               ├── test.controller.ts
│               └── test.controller.spec.ts

This file was generated by scanning the workspace. If you want a more detailed version (per-file descriptions, sizes, or JSON manifest), tell me which format you prefer and I'll produce it.
