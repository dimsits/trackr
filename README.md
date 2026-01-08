# Tracker

A **pipeline-based CRM** for personal applications: you create pipelines (e.g., *Interested → Applied → Interview → Offer → Rejected*), drag cards, attach notes/files, schedule reminders, and track outcomes.

---

## 2) High-level system

### Context

* Users manage **Applications** inside **Workspaces**
* Each workspace has **Pipelines** (columns/stages)
* Each application has **Activities** (notes, emails, interviews), **Tasks/Reminders**, and optional **Files**

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

* **UI:** Kanban pipeline board (drag/drop), list view, calendar/reminders, analytics
* **State:** optimistic updates (drag card → update instantly, rollback on failure)
* **Offline-friendly (optional):** local cache + background sync (big plus)

### Backend (API / BFF)

1. **Auth & Identity**

   * Email+password or magic link, OAuth (Google)
   * Sessions via JWT or server sessions
2. **Workspace & Membership**

   * Personal workspace by default
   * Optional team mode (RBAC)
3. **Pipeline**

   * Pipeline templates, stages/columns, ordering
4. **Application**

   * Company, role, source, salary range, links, status(stage), priority
5. **Activity Feed**

   * Notes, interview logs, call logs, “moved stage” events
6. **Tasks & Reminders**

   * follow-ups, interview schedules, deadlines
7. **Files**

   * resume versions, cover letters, screenshots (stored in object storage)
8. **Integrations (optional)**

   * Calendar sync, email parsing, job boards import

### Worker (Async jobs)

* Send reminders (email/push)
* Cleanup expired uploads
* Generate analytics snapshots
* Webhook delivery (if integrations)

---

## 4) Data model 

### Key entities

* **User**(id, name, email, hashed_pw, created_at)
* **Workspace**(id, owner_id, name)
* **Membership**(workspace_id, user_id, role)  // optional team support
* **Pipeline**(id, workspace_id, name, is_default)
* **Stage**(id, pipeline_id, name, position, color)
* **Application**

  * (id, workspace_id, pipeline_id, stage_id, company, role, link, source, location,
    comp_min, comp_max, priority, status, created_at, updated_at)
* **Activity**

  * (id, application_id, type, content, created_at, created_by)
  * types: NOTE | STAGE_MOVED | INTERVIEW | EMAIL | CALL | OFFER
* **Task**

  * (id, workspace_id, application_id, title, due_at, status, created_at)
* **File**

  * (id, workspace_id, application_id, name, storage_key, mime, size, created_at)

### Important constraints

* Stage ordering via `position`
* Application in exactly one `stage_id`
* Soft-delete (deleted_at) is a plus for real product feel

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
* `POST /pipelines/:id/stages` (reorder included)

**Applications**

* `GET /workspaces/:id/applications?pipelineId=&stageId=&q=`
* `POST /workspaces/:id/applications`
* `PATCH /applications/:id` (includes moving stage)
* `DELETE /applications/:id`

**Activities**

* `GET /applications/:id/activities`
* `POST /applications/:id/activities`

**Tasks**

* `GET /workspaces/:id/tasks?dueBefore=`
* `POST /applications/:id/tasks`
* `PATCH /tasks/:id`

**Files**

* `POST /files/upload-url` (pre-signed upload)
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


**Frontend**

* Optimistic update local state
* Call `PATCH /applications/:id { stage_id: newStageId, position: newPos }`

**Backend**

* Transaction:

  * Update application stage
  * Recompute positions in affected stage (or use fractional indexing)
  * Insert Activity event `STAGE_MOVED`

---

## 7) Notifications & reminders

### Minimal approach

* Store tasks with `due_at`
* Worker runs every minute:

  * find tasks due soon
  * send email/push
  * mark as notified



