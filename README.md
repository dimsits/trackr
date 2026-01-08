# Trackr

## 1) High-level architecture

### Clients

* **Web App (Next.js)**

  * UI: pipeline board + forms
  * Talks to API via HTTPS (REST)
  * Auth: receives access token (and refresh token if you use refresh flow)

### Backend

* **API Server (NestJS)**

  * Modules: Auth, Users, Boards, Applications, Stages, Activity, Tags, Files (optional)
  * Validates requests, enforces ownership, returns JSON
  * Issues JWTs

### Data

* **PostgreSQL** (recommended)
* **Prisma ORM** (recommended for speed + types)

### Optional

* **Redis** (later, for rate limiting, caching, refresh token blacklist)
* **Object Storage** (S3/R2) if you add attachments

---

## 2) Monorepo layout (recommended)

```
trackr/
  apps/
    web/        # Next.js
    api/        # NestJS
  packages/
    shared/     # shared types/validators (zod), constants
    ui/         # optional shared components
  docker/
  README.md
```

**Why:** shared types and DTO contracts stop frontend/backend drift.

---

## 3) Core domain model (what the app “is”)

### Entities

* **User**
* **Board** (one per user by default; can support many later)
* **Stage** (columns like Saved/Applied/etc.)
* **Application** (cards inside stages)
* **ActivityLog** (audit trail of changes/moves)
* **Tag** + **ApplicationTag** (many-to-many)
* **Reminder** (optional, for follow-ups)

### Relationships (simple)

* User 1—N Boards
* Board 1—N Stages
* Board 1—N Applications
* Stage 1—N Applications
* Application 1—N ActivityLog
* Application N—M Tags

---

## 4) Database schema (Prisma-style, production-friendly)

Key design choices:

* **Sort order**: `position` fields for stages and cards (fast board rendering)
* **Ownership**: every row has `userId` (or boardId -> userId) so checks are easy
* **Audit**: activity logs for credibility

Minimal schema:

**User**

* id (uuid)
* email (unique)
* passwordHash
* name (optional)
* createdAt, updatedAt

**Board**

* id (uuid)
* userId (fk)
* name
* createdAt, updatedAt

**Stage**

* id (uuid)
* boardId (fk)
* name
* position (int)
* isDefault (bool)
* createdAt, updatedAt

**Application**

* id (uuid)
* boardId (fk)
* stageId (fk)
* position (int)
* companyName
* roleTitle
* applicationUrl (optional)
* location (optional)
* compensation (optional string)
* statusNote (optional)
* appliedAt (optional datetime)
* lastContactAt (optional datetime)
* nextFollowUpAt (optional datetime)
* createdAt, updatedAt

**ActivityLog**

* id (uuid)
* applicationId (fk)
* actorUserId (fk)
* type (enum: CREATED, UPDATED, MOVED_STAGE, NOTE_ADDED, DELETED)
* metadata (json)
* createdAt

**Tag**

* id (uuid)
* boardId (fk)
* name
* color (optional)
* createdAt

**ApplicationTag**

* applicationId (fk)
* tagId (fk)
* primary key (applicationId, tagId)

---

## 5) API design (REST endpoints)

### Auth

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/refresh` (optional)
* `POST /auth/logout` (optional)
* `GET /auth/me`

### Boards

* `GET /boards`
* `POST /boards`
* `GET /boards/:id`

### Stages

* `GET /boards/:boardId/stages`
* `POST /boards/:boardId/stages`
* `PATCH /stages/:id` (rename / reorder / archive)
* `POST /stages/reorder` (bulk reorder)

### Applications

* `GET /boards/:boardId/applications?stageId=&q=&tagId=`
* `POST /boards/:boardId/applications`
* `GET /applications/:id`
* `PATCH /applications/:id`
* `DELETE /applications/:id`

### Moving cards (important)

* `POST /applications/:id/move`

  * body: `{ toStageId, toPosition }`

### Activity

* `GET /applications/:id/activity`

### Tags

* `GET /boards/:boardId/tags`
* `POST /boards/:boardId/tags`
* `POST /applications/:id/tags` (bulk add/remove)

**MVP shortcut:** one board per user; still keep boardId in schema.

---

## 6) Backend architecture (NestJS modules)

```
api/src/
  app.module.ts
  config/
  prisma/
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    jwt.strategy.ts
    guards/jwt-auth.guard.ts
  users/
  boards/
  stages/
  applications/
  activity/
  tags/
  common/
    decorators/user.decorator.ts
    filters/http-exception.filter.ts
    pipes/zod-validation.pipe.ts (optional)
```

### Service boundaries

* **ApplicationsService** owns:

  * create/update/delete application
  * move logic (position updates)
  * emits ActivityLog entries
* **StagesService** owns:

  * default stage setup
  * stage reorder
* **AuthService** owns:

  * password hashing
  * token issuance

### Authorization rule (simple & strong)

* Every query includes `board.userId = req.user.id`
* No “admin roles” needed for MVP

---

## 7) Move/reorder algorithm (board feels “real”)

### Stages

* Reorder: send array of stageIds in new order -> update `position` sequentially.

### Applications

* Each stage has a `position` integer (0..n)
* Moving card:

  1. Remove from old stage: compress positions
  2. Insert into new stage at `toPosition`: shift positions down
* Keep it transactional (Prisma transaction)

This is the “pipeline UX” core. Even without drag-drop, this architecture supports it.

---

## 8) Frontend architecture (Next.js)

### Pages / routes

* `/login`
* `/register`
* `/app` (board view)
* `/app/application/[id]` (details drawer/page optional)

### UI components

* `BoardView`
* `StageColumn`
* `ApplicationCard`
* `ApplicationModal` (create/edit)
* `MoveMenu` (quick move)
* `FiltersBar`

### Data layer

* Use **React Query** or **SWR**
* Cache keys:

  * `['board', boardId]`
  * `['stages', boardId]`
  * `['apps', boardId, filters]`

### Auth handling (fast + deployable)

**Option A (simplest): JWT stored in HttpOnly cookies**

* Next.js calls API with cookies automatically
* Better security, less token handling mess

**Option B: access token in memory + refresh cookie**

* More work, but scalable

For a portfolio project, **Option A** is clean.

---

## 9) Security, validation, and quality signals

* Password hashing: **argon2** or **bcrypt**
* DTO validation: `class-validator` or Zod
* CORS: allow your web domain
* Rate limit login (optional)
* Audit trail: ActivityLog (makes it look enterprise)

---

## 10) Deployment architecture (simple and credible)

### Recommended

* **Web (Next.js):** Vercel
* **API (NestJS):** Render / Fly.io / Railway
* **DB:** Neon / Supabase / Railway Postgres

### Environment variables

**web**

* `NEXT_PUBLIC_API_URL=...`

**api**

* `DATABASE_URL=...`
* `JWT_SECRET=...`
* `CORS_ORIGIN=...`

---

