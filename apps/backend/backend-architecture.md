## 1) Decide the backend stack inside NestJS (my recommendation)

For a clean Trackr MVP, do this:

* **DB**: Postgres
* **ORM**: Prisma (fast DX, great migrations)
* **Auth**: JWT access token (+ refresh token later)
* **Validation**: `class-validator` + `class-transformer`
* **Docs**: Swagger (`@nestjs/swagger`)
* **Files**: “pre-signed upload URL” pattern later (S3/R2/MinIO)
* **Async**: add a Worker later (BullMQ) for reminders 

If you already prefer TypeORM, you can still follow the exact same module boundaries.

## 2) Folder/module architecture (matches README core modules)


```
src/
  app.module.ts
  common/
    guards/
    decorators/
    filters/
    pipes/
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    jwt.strategy.ts
  users/
  workspaces/
  memberships/
  pipelines/
  stages/
  applications/
  activities/
  tasks/
  files/
  prisma/ (or database/)
```

## 3) Data model (Prisma schema starter aligned to README)

Implement these entities first (MVP):

* User
* Workspace
* Membership
* Pipeline
* Stage
* Application
* Activity
* Task
* File

…and enforce the key constraints:

* `Stage.position` controls ordering
* `Application.stageId` is required (exactly one stage)
* consider `deletedAt` soft delete fields 

## 4) Build order (so you always have something testable)

### Phase A — foundations

1. **Health check**: `GET /health`
2. **Prisma + Postgres**: connect + migration
3. **Auth**:

   * `POST /auth/login`
   * `POST /auth/logout` (optional early; can be noop for JWT)
   * `GET /me` 

### Phase B — core domain (minimum usable Trackr backend)

4. **Workspaces**

   * `GET /workspaces`
   * `POST /workspaces`
   * `GET /workspaces/:id`
5. **Pipelines + Stages**

   * `GET /workspaces/:id/pipelines`
   * `POST /workspaces/:id/pipelines`
   * `PATCH /pipelines/:id`
   * `POST /pipelines/:id/stages` (create + reorder) 
6. **Applications**

   * `GET /workspaces/:id/applications?pipelineId=&stageId=&q=`
   * `POST /workspaces/:id/applications`
   * `PATCH /applications/:id`
   * `DELETE /applications/:id` 

### Phase C — “Trackr features”

7. **Activities**

   * `GET /applications/:id/activities`
   * `POST /applications/:id/activities` 
8. **Tasks/Reminders**

   * `GET /workspaces/:id/tasks?dueBefore=`
   * `POST /applications/:id/tasks`
   * `PATCH /tasks/:id` 
9. **Files (stub first)**

   * Start with metadata table + “fake upload” locally
   * Later add `POST /files/upload-url` + storage provider 

## 5) Drag-and-drop correctness (the one place you must be strict)

When the client moves a card, it calls:

`PATCH /applications/:id { stage_id, position }` 

Backend rule of thumb (MVP-safe):

* wrap in a **transaction**
* update the application’s `stageId`
* re-assign positions for affected applications in that stage
* insert an `Activity` row with type `STAGE_MOVED` 

Implementation detail suggestion:

* Use **integer positions** initially (1..N) and “repack” the whole stage on every move (fine for MVP).
* Upgrade later to fractional indexing if you want to optimize.

## 6) Authorization model (simple but correct)

Use **workspace-scoped authorization** everywhere:

* Every request resolves the user → verifies membership in the workspace
* “Personal workspace by default” means on signup you auto-create:

  * Workspace (owned by user)
  * Membership role = `OWNER` 

