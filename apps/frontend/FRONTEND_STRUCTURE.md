# Frontend File Structure

```
frontend/
├── .env.local
├── .next/
├── .gitignore (implied)
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   └── workspaces/
│   │       ├── page.tsx
│   │       └── [workspaceId]/
│   │           └── page.tsx
│   └── (auth)/
│       └── login/
│           └── page.tsx
├── components/
│   ├── AuthGate.tsx
│   ├── application/
│   │   ├── ActivitiesSection.tsx
│   │   ├── ApplicationDrawer.tsx
│   │   ├── DrawerSection.tsx
│   │   ├── DrawerShell.tsx
│   │   ├── EditApplication.tsx
│   │   ├── FileSection.tsx
│   │   ├── SectionBoundary.tsx
│   │   └── TasksSection.tsx
│   └── board/
│       ├── Board.tsx
│       ├── Card.tsx
│       ├── Column.tsx
│       └── types.ts
├── hooks/
│   ├── useActivities.ts
│   ├── useApplications.ts
│   ├── useCreateActivity.ts
│   ├── useCreateApplication.ts
│   ├── useCreateTask.ts
# Frontend File Structure

```
frontend/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   └── workspaces/
│   │       ├── page.tsx
│   │       └── [workspaceId]/
│   │           └── page.tsx
│   └── (auth)/
│       ├── login/
│       │   └── page.tsx
│       └── register/
│           └── page.tsx
├── components/
│   ├── AuthGate.tsx
│   ├── Navbar.tsx
│   ├── ui/
│   │   └── Modal.tsx
│   ├── application/
│   │   ├── ActivitiesSection.tsx
│   │   ├── ApplicationDrawer.tsx
│   │   ├── DrawerSection.tsx
│   │   ├── DrawerShell.tsx
│   │   ├── EditApplication.tsx
│   │   ├── FileSection.tsx
+│   │   ├── SectionBoundary.tsx
│   │   └── TasksSection.tsx
│   └── board/
│       ├── Board.tsx
│       ├── Card.tsx
│       ├── Column.tsx
│       └── types.ts
├── hooks/
│   ├── useActivities.ts
│   ├── useApplications.ts
│   ├── useCreateActivity.ts
│   ├── useCreateApplication.ts
│   ├── useCreatePipeline.ts
│   ├── useCreateTask.ts
│   ├── useCreateWorkspace.ts
│   ├── useDeleteApplication.ts
│   ├── useDownloadFile.ts
│   ├── useFiles.ts
│   ├── useMe.ts
│   ├── useMoveApplication.ts
│   ├── usePipelines.ts
│   ├── useRegister.ts
│   ├── useStages.ts
│   ├── useTasks.ts
│   ├── useUpdateApplication.ts
│   ├── useUpdateTask.ts
│   ├── useUploadFile.ts
│   ├── useWorkspaces.ts
│   └── useLogout.ts
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── queryClient.ts
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── dev-pipeline.MD
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Key Directories

- **app/**: Next.js app directory with route groups and pages
  - **(app)/**: Protected application routes (workspace-specific pages)
  - **(auth)/**: Authentication routes (login, register)
- **components/**: Reusable React components
  - **ui/**: Generic UI components (e.g., `Modal`)
  - **application/**: Application-related composite components and drawers
  - **board/**: Kanban board components
- **hooks/**: Custom React hooks for API calls and state management (one hook per feature)
- **lib/**: API client, auth helpers, and shared utilities (`api.ts`, `auth.ts`, `queryClient.ts`)
- **public/**: Static assets (SVGs, images)

This file represents the current frontend layout as of the scan. If you want, I can also:

- Add short descriptions for each component/hook.
- Generate a graphical tree or JSON manifest for automation.
- Commit these changes to git.
