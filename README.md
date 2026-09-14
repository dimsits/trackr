# Trackr

**Trackr** is a **lightweight web app** that helps **students and professionals** organize, track, and manage their **job or OJT applications** through a **simple, visual pipeline**.

Users can create custom pipelines (e.g., *Interested → Applied → Interview → Offer → Rejected*), drag application cards between stages, attach notes and files, schedule reminders, and track outcomes — all in one focused workspace.

Trackr is designed to be:

* **Fast and intuitive** (drag-and-drop first)
* **Personal by default**, with optional team support
* **Opinionated but flexible**, avoiding enterprise CRM bloat

---

## 1) Quick start

Trackr is a single npm workspace. You never install dependencies per app, and
you never need a second terminal.

```bash
git clone <repository-url>
cd trackr
npm run setup
npm run dev
```

| URL | What |
| --- | --- |
| http://localhost:3000 | Frontend (Next.js) |
| http://localhost:3001/api | API base (NestJS) |
| http://localhost:3001/api/health | Health check |
| http://localhost:3001/docs | Swagger UI |
| localhost:5432 | PostgreSQL (user / password / db: `trackr` / `trackrpass` / `trackr`) |

Seeded development login: **seed@trackr.dev** / **password123**

### Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Git | any recent | to clone the repository |
| Node.js | **>= 20.11.0** | `setup` refuses to run on older releases |
| npm | **>= 10** | ships with Node.js; workspaces are required |
| Docker Desktop | any recent | must be **running** - it hosts PostgreSQL |

No global CLIs are needed. Nest, Next, Prisma, ESLint and Jest all run from the
repository's own `node_modules`.

### What `npm run setup` does

It is safe to re-run at any time - it is idempotent and never destroys data.

1. Checks Node, npm, Docker, the Docker daemon and Docker Compose, failing early
   with an actionable message if any is missing.
2. Runs `npm ci` at the root, installing both workspaces from the single
   committed lockfile.
3. Creates the local environment files listed below **only if they are missing**.
4. Starts PostgreSQL and waits for its healthcheck to pass.
5. Generates the Prisma client and applies committed migrations with
   `prisma migrate deploy` (never `migrate reset`).
6. Runs the idempotent development seed.
7. Builds both applications as an integration check.

### Environment files

| File | Created from | Contains |
| --- | --- | --- |
| `apps/backend/.env` | `apps/backend/.env.example` | database URL, JWT settings, CORS origin, optional R2 |
| `apps/frontend/.env.local` | `apps/frontend/.env.example` | `NEXT_PUBLIC_API_URL` |

**Existing environment files are never overwritten.** If `apps/backend/.env`
already exists, `setup` leaves it exactly as it is, including your secrets. When
it *does* create the backend file, it generates a fresh random `JWT_SECRET`; no
secret is ever committed to the repository.

`NEXT_PUBLIC_API_URL` must include the backend's global prefix
(`http://localhost:3001/api`). The frontend derives both its API base and its
health-probe URL from that single value, so the two can never drift apart.

### Everyday commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Ensures PostgreSQL is healthy, applies pending migrations, then runs both apps with `WEB` / `API` prefixed logs |
| `npm run dev:frontend` | Frontend only |
| `npm run dev:backend` | Backend only (also ensures the database is ready) |
| `npm run build` | Builds both workspaces |
| `npm run lint` | Lints both workspaces |
| `npm run test` | Runs workspace test suites |
| `npm run db:up` / `db:down` | Start / stop PostgreSQL |
| `npm run db:logs` | Follow PostgreSQL logs |
| `npm run db:migrate` | Apply committed migrations (`prisma migrate deploy`) |
| `npm run db:seed` | Re-run the idempotent seed |

`npm run dev` applies migrations but deliberately **does not seed** on every
start. Run `npm run db:seed` when you want the sample data refreshed.

To target one workspace directly, use npm's workspace flag rather than `cd`:

```bash
npm run <script> --workspace @trackr/backend
npm run <script> --workspace @trackr/frontend
```

### Database persistence

PostgreSQL data lives in the Docker volume `trackr_trackr_pgdata` and **survives
everything in this repository**:

* `Ctrl+C` stops the apps but intentionally leaves PostgreSQL running, so the
  next `npm run dev` starts fast.
* `npm run db:down` stops and removes the *container*; the volume, and therefore
  your data, is kept.
* Nothing in `setup` or `dev` ever runs `prisma migrate reset` or deletes a volume.

To deliberately start from an empty database (this **erases** local data):

```bash
docker compose down -v
npm run setup
```

### Optional: Cloudflare R2 file storage

File uploads are optional locally. With no R2 credentials the API starts
normally, logs a warning, and every non-file feature works; only the upload and
download endpoints respond with `503` and an explanatory message.

To enable it, set all four of `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY` and `R2_BUCKET` in `apps/backend/.env`. Setting only some
of them is rejected at boot so the configuration cannot be half-applied. In
production all four are required and the API refuses to start without them.

### Troubleshooting

**"The Docker daemon is not running"**
Start Docker Desktop and wait until it reports *Engine running*, then re-run the
command. `setup` and `dev` both check this before doing anything else.

**Port 5432 already in use / "Authentication failed against database server"**
Another PostgreSQL (a native install, or another project's container) already
owns the port, so Trackr connects to the wrong server. Either stop that service,
or move Trackr's database to a free port by creating a `.env` file in the
repository root:

```bash
POSTGRES_PORT=5433
```

and changing the port in `DATABASE_URL` inside `apps/backend/.env` to match.

**Port 3000 or 3001 already in use**
Stop whatever owns the port, or set `PORT` in `apps/backend/.env` (and update
`NEXT_PUBLIC_API_URL` in `apps/frontend/.env.local` to match).

**"Invalid environment configuration"**
The API validates its environment at boot and lists every offending variable by
name, without printing values. Compare `apps/backend/.env` against
`apps/backend/.env.example`, or delete the file and re-run `npm run setup` to
regenerate it.

**`npm ci` reports the lockfile is out of sync**
Run `npm install` once to refresh the root `package-lock.json`, then commit it.

---

## 2) High-level system

### Context

* Users manage **Applications** inside **Workspaces**
* Each workspace contains one or more **Pipelines** (columns/stages)
* Each application can have **Activities** (notes, emails, interviews), **Tasks/Reminders**, and optional **Files**

### Container diagram

```
[Web/Mobile Client]
   |  HTTPS (REST/GraphQL)
   v
[API Gateway / BFF]
   |-> Auth (OIDC/OAuth/Email OTP)
   |-> Core API (Domain services)
   |-> Realtime (WS/SSE)  <-- optional for live drag/drop sync
   v
[Database] <----> [Search Index] (optional)
   |
   +--> [Object Storage] (files)
   |
   +--> [Queue/Worker] (reminders, emails, webhooks)
           |
           +--> Email/SMS/Push Providers
```

---

## 3) Core modules

### Frontend (Client)

* **UI:** Kanban-style pipeline board (drag/drop), list view, calendar/reminders, analytics
* **State management:** Optimistic updates (drag card → instant UI update, rollback on failure)
* **Offline-friendly (optional):** Local cache with background sync

### Backend (API / BFF)

1. **Auth & Identity**

   * Email + password or magic link
   * OAuth (e.g., Google)
   * Sessions via JWT or server-side sessions

2. **Workspace & Membership**

   * Personal workspace by default
   * Optional team mode with role-based access control (RBAC)

3. **Pipeline**

   * Pipeline templates
   * Configurable stages/columns
   * Stage ordering and customization

4. **Application**

   * Company, role, source, salary range, links
   * Current stage and priority

5. **Activity Feed**

   * Notes, interview logs, call logs
   * System events such as “moved stage”

6. **Tasks & Reminders**

   * Follow-ups, interview schedules, deadlines

7. **Files**

   * Resumes, cover letters, screenshots
   * Stored in object storage

8. **Integrations (optional)**

   * Calendar sync
   * Email parsing
   * Job board imports

### Worker (Async jobs)

* Send reminders (email/push notifications)
* Cleanup expired uploads
* Generate analytics snapshots
* Deliver webhooks for integrations

---

## 4) Data model

### Key entities

* **User**(id, name, email, hashed_pw, created_at)
* **Workspace**(id, owner_id, name)
* **Membership**(workspace_id, user_id, role)
* **Pipeline**(id, workspace_id, name, is_default)
* **Stage**(id, pipeline_id, name, position, color)
* **Application**

  * (id, workspace_id, pipeline_id, stage_id, company, role, link, source, location,
    comp_min, comp_max, priority, status, created_at, updated_at)
* **Activity**

  * (id, application_id, type, content, created_at, created_by)
  * types: `NOTE | STAGE_MOVED | INTERVIEW | EMAIL | CALL | OFFER`
* **Task**

  * (id, workspace_id, application_id, title, due_at, status, created_at)
* **File**

  * (id, workspace_id, application_id, name, storage_key, mime, size, created_at)

### Important constraints

* Stage ordering is controlled via `position`
* An application belongs to exactly one `stage_id`
* Soft deletes (`deleted_at`) are recommended for auditability and analytics

---

## 5) API design

### REST-style endpoints

**Auth**

* `POST /auth/login`
* `POST /auth/logout`
* `GET /me`

**Workspaces**

* `GET /workspaces`
* `POST /workspaces`
* `GET /workspaces/:id`

**Pipeline**

* `GET /workspaces/:id/pipelines`
* `POST /workspaces/:id/pipelines`
* `PATCH /pipelines/:id`
* `POST /pipelines/:id/stages` (includes reordering)

**Applications**

* `GET /workspaces/:id/applications?pipelineId=&stageId=&q=`
* `POST /workspaces/:id/applications`
* `PATCH /applications/:id` (including stage movement)
* `DELETE /applications/:id`

**Activities**

* `GET /applications/:id/activities`
* `POST /applications/:id/activities`

**Tasks**

* `GET /workspaces/:id/tasks?dueBefore=`
* `POST /applications/:id/tasks`
* `PATCH /tasks/:id`

**Files**

* `POST /files/upload-url`
* `POST /applications/:id/files`
* `GET /files/:id/download-url`

### Realtime

* WS/SSE channel: `workspace:{id}`
* Events:

  * `application.created`
  * `application.updated`
  * `application.moved_stage`
  * `task.due_soon`

---

## 6) Drag-and-drop correctness

### Frontend

* Perform optimistic UI updates
* Call:

  ```
  PATCH /applications/:id
  {
    stage_id: newStageId,
    position: newPos
  }
  ```

### Backend

* Execute a transaction:

  * Update application stage
  * Recompute positions in the affected stage (or use fractional indexing)
  * Insert an `Activity` event of type `STAGE_MOVED`

---

## 7) Notifications & reminders

### Minimal approach

* Store tasks with a `due_at` timestamp
* Background worker runs every minute:

  * Find tasks due soon
  * Send email or push notifications
  * Mark tasks as notified


