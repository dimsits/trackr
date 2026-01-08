# Trackr

**Trackr** is a **lightweight web app** that helps **students and professionals** organize, track, and manage their **job or OJT applications** through a **simple, visual pipeline**.

Users can create custom pipelines (e.g., *Interested → Applied → Interview → Offer → Rejected*), drag application cards between stages, attach notes and files, schedule reminders, and track outcomes — all in one focused workspace.

Trackr is designed to be:

* **Fast and intuitive** (drag-and-drop first)
* **Personal by default**, with optional team support
* **Opinionated but flexible**, avoiding enterprise CRM bloat

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


