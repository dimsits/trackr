# Frontend File Structure

```
frontend/
├── app/                              # Routes only: orchestration and composition
│   ├── globals.css                   # Calm Momentum design tokens (@theme) and base styles
│   ├── layout.tsx                    # Root layout, Manrope font, metadata
│   ├── page.tsx                      # Landing page
│   ├── providers.tsx                 # React Query + Framer Motion (reduced-motion aware)
│   ├── (auth)/
│   │   ├── layout.tsx                # Shared auth frame
│   │   ├── login/                    # page.tsx + LoginClient.tsx
│   │   └── register/                 # page.tsx + RegisterClient.tsx
│   └── (app)/
│       ├── layout.tsx                # AuthGate + AppShell
│       └── workspaces/
│           ├── page.tsx              # Workspace chooser
│           └── [workspaceId]/page.tsx  # Board route: queries, URL state, feature composition
├── components/
│   ├── brand/Logo.tsx                # Wordmark and mark
│   ├── shell/                        # AppShell, AppHeader, AccountMenu, AuthGate
│   └── ui/                           # Primitives: Button, IconButton, Field (Input/Select/Textarea),
│                                     # Checkbox, Badge, Alert, Dialog, Sheet, Overlay, Menu, Tabs,
│                                     # Skeleton, Spinner, EmptyState, Monogram
├── features/
│   ├── auth/                         # AuthLayout, PasswordInput
│   ├── landing/                      # Header, product preview, proof sections, footer, sample data
│   ├── workspaces/                   # WorkspacesView, WorkspaceCard, CreateWorkspaceDialog
│   ├── workspace-board/              # BoardHeader (command bar), board states, create dialogs, useBoardFilters
│   ├── board/                        # Board, BoardColumn, ApplicationCard(+Content), PriorityBadge,
│   │                                 # useBoardDnd (drag controller), ordering.ts (pure move logic), stageColors
│   └── application-details/          # ApplicationSheet, summary, edit form, delete, activity/tasks/files sections
├── hooks/                            # One React Query hook per endpoint (query keys and invalidation live here)
├── lib/                              # api client, auth token storage, config, query client, cn, format, errors
└── types/                            # Domain types matching the API responses
```

## Conventions

- **Routes stay thin.** `app/` files wire route params and queries to feature components.
- **Styling uses semantic tokens** defined in `app/globals.css` (`bg-surface`, `text-text-muted`,
  `border-border`, `rounded-card`, `shadow-raised`, ...). The default Tailwind palette is intentionally
  cleared, so raw colour utilities do not exist.
- **Primitives do not merge conflicting classes.** Pass layout classes (width, margin) through
  `className`; use a variant or prop for colour, size or radius changes.
- **Overlays** (`Dialog`, `Sheet`) share `components/ui/Overlay.tsx` for focus trapping, focus
  restoration, Escape handling, scroll locking and stacking.
- **Board ordering** is owned by `features/board/useBoardDnd.ts`. It renders `optimistic ?? applications`
  and clears the optimistic list once the move mutation has refetched server truth.
