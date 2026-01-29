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
│   ├── useDeleteApplication.ts
│   ├── useDownloadFile.ts
│   ├── useFiles.ts
│   ├── useMe.ts
│   ├── useMoveApplication.ts
│   ├── usePipelines.ts
│   ├── useStages.ts
│   ├── useTasks.ts
│   ├── useUpdateApplication.ts
│   ├── useUpdateTask.ts
│   ├── useUploadFile.ts
│   └── useWorkspaces.ts
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── queryClient.ts
├── node_modules/
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
  - **(app)/**: Protected application routes
  - **(auth)/**: Authentication routes
- **components/**: Reusable React components
  - **application/**: Application-related components
  - **board/**: Kanban board components
- **hooks/**: Custom React hooks for API calls and state management
- **lib/**: Utility functions and configurations (API, auth, query client)
- **public/**: Static assets
