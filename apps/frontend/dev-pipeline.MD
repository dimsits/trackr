## Full Next.js front-end development pipeline (setup → ship)

### 0) Define scope (1–2 hours)

Lock the “MVP screens” and data they need:

* Auth: Login
* App: Workspace list/switcher
* Board: Pipeline selector + stages + applications (drag/drop)
* Application create/edit (modal/drawer)
* Tasks + Activities (basic)
* Files (optional, last)

Source of truth: your domain + endpoints already defined.  

---

### 1) Repo + tooling setup (day 1)

**Create app**

```bash
pnpm create next-app trackr-web --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
cd trackr-web
pnpm add @tanstack/react-query zod @dnd-kit/core @dnd-kit/sortable
```

**Environment**

* `.env.local`

  * `NEXT_PUBLIC_API_URL=http://localhost:3001` (or your backend)
* Decide dev auth strategy:

  * Cookie-based session recommended (simplifies frontend)
  * If you’re using headers (e.g., `x-user-id`) for dev, centralize it in the API client.

**Project structure (stable)**

* `src/lib/` (api client, auth helpers, query client)
* `src/hooks/` (React Query hooks)
* `src/components/board/` (Board, Column, Card)
* `src/types/` + Zod schemas mirroring DTOs

---

### 2) API contract + types (day 1–2)

**Mirror DTOs with Zod** (prevents frontend/backend drift):

* LoginDto
* Workspace response
* Pipeline + Stage
* Application (create/update)
* Task + Activity
* File upload flow

Use the documented endpoints as the contract. 

Deliverable: `src/types/dto.ts` + `src/lib/api.ts` (single fetch wrapper with error handling).

---

### 3) App foundation (day 2)

**Providers**

* React Query provider in `app/layout.tsx`
* Global toasts/error boundary (simple)

**Routing layout**

* `(auth)/login`
* `(app)/workspaces`
* `(app)/workspaces/[workspaceId]` (board)

**Auth gate**

* On app routes: call `/api/me`
* If unauthorized: redirect to `/login`
  (Your backend supports `/api/me` in the docs.) 

Deliverable: you can navigate and see “protected” pages only when logged in.

---

### 4) Data read path first (day 3–4)

Build read-only UI with “ugly Tailwind”:

1. Load workspaces: `GET /api/workspaces` 
2. Load pipelines: `GET /api/workspaces/{workspaceId}/pipelines` 
3. Load stages: `GET /api/pipelines/{pipelineId}/stages` 
4. Load applications: `GET /api/workspaces/{workspaceId}/applications?pipelineId=` 

Deliverable: board renders columns and cards correctly with real data.

---

### 5) Write path basics (day 4–5)

Implement CRUD in this order:

**A) Create application**

* `POST /api/workspaces/{workspaceId}/applications` 
* Put modal/drawer for create
* After success: invalidate applications query

**B) Update application fields**

* `PATCH /api/applications/{id}` 
* Keep edit minimal: company/role/priority/status

**C) Delete (soft delete)**

* `DELETE /api/applications/{id}` 

Deliverable: you can add/edit/remove applications and the board stays consistent.

---

### 6) Drag-and-drop (day 5–7)

Use **dnd-kit**.
Key requirement: **optimistic updates**:

* Immediately move card in UI
* Call backend:

  * `PATCH /api/applications/{id}` with `{ stageId, position }` 
* On error: rollback UI state

Deliverable: moving cards feels instant and never desyncs silently.

---

### 7) Activities + Tasks (day 7–9)

**Activities**

* Read: `GET /api/applications/{applicationId}/activities` 
* Write NOTE: `POST /api/applications/{applicationId}/activities` 

**Tasks**

* Create: `POST /api/applications/{applicationId}/tasks` 
* List by workspace: `GET /api/workspaces/{workspaceId}/tasks` 
* Update: `PATCH /api/tasks/{taskId}` 

Deliverable: application detail drawer shows activity log + tasks.

---

### 8) Files (optional, last) (day 9–11)

Implement the two-step upload:

1. `POST /api/files/upload-url` → presigned URL 
2. Upload directly to storage (PUT to presigned)
3. `POST /api/applications/{id}/files` to register metadata 
4. Download via `GET /api/files/{id}/download-url` 

Deliverable: attach/download/delete files from an application.

---

### 9) UI polish (after core works) (day 11–13)

* Consistent spacing/typography
* Empty states + loading skeletons
* Error toasts + retry buttons
* Keyboard/accessibility basics (focus states)
* Responsive layout (desktop-first is fine)

Rule: do not refactor UI before flows are correct.

---

### 10) Quality checks (day 13–14)

**Manual test script**

* Login → load workspace → load pipeline → board renders
* Create app → shows in correct stage
* Drag app between stages → persists after refresh
* Edit fields → persists
* Add activity note → shows
* Add task → appears in workspace tasks list
* Upload file (if enabled) → can download

**Basic performance**

* Use React Query caching properly
* Avoid refetch storms (stable query keys)
* Debounce search `q` on applications listing if added

---

### 11) Production hardening (day 14–15)

* Set `NEXT_PUBLIC_API_URL` for prod
* Ensure CORS/cookies/session are correct
* Add route protection for all `(app)` routes
* Add build-time checks:

  * `pnpm lint`
  * `pnpm build`

---

### 12) Deploy (finish)

* Deploy frontend (Vercel)
* Deploy backend (wherever you host)
* Verify:

  * Auth works in prod
  * Cookies + HTTPS correct
  * File upload works (if used)

---

## Deliverable checklist (what “done” means)

* [ ] Login + `/me` gate works
* [ ] Workspace selection works
* [ ] Board renders pipelines/stages/apps
* [ ] Create/edit/delete application works
* [ ] Drag/drop stage movement works with optimistic updates
* [ ] Activities + tasks work
* [ ] Files optional and working
* [ ] Handles loading/errors/empty states
* [ ] Deployed and usable end-to-end
