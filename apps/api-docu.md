# Trackr API Documentation

**Version:** 1.0
**Specification:** OpenAPI 3.0
**Base Path:** `/api`
**Format:** REST (JSON)

---

## 1. Overview

The Trackr API powers the Trackr application — a workspace-based system for tracking job/OJT applications through pipelines, stages, tasks, activities, and files.

All APIs assume **authenticated users** and **workspace-scoped authorization**.

---

## 2. Authentication & Headers

### Development Authentication

JWT/Session-based Auth

---

## 3. Health & Root

### GET `/api`

Basic API root.

**Response — 200**

```json
{}
```

---

### GET `/api/health`

Health check endpoint.

**Response — 200**

```json
{
  "status": "ok"
}
```

---

## 4. Test / Authorization Validation

### GET `/api/test/workspace/{workspaceId}/member`

Verifies that the user is a **member** of the workspace.

**Headers**

```
x-user-id: string
```

**Path Params**

| Name        | Type   | Required |
| ----------- | ------ | -------- |
| workspaceId | string | yes      |

**Response — 200**

```json
{}
```

---

### GET `/api/test/workspace/{workspaceId}/admin`

Verifies that the user has **admin/owner** privileges.

**Headers**

```
x-user-id: string
```

**Path Params**

| Name        | Type   | Required |
| ----------- | ------ | -------- |
| workspaceId | string | yes      |

**Response — 200**

```json
{}
```

---

## 5. Auth

### POST `/api/auth/login`

Authenticate using email and password.

**Request Body**

```json
{
  "email": "seed@trackr.dev",
  "password": "password123"
}
```

**Response — 200**

```json
{
  "accessToken": "string"
}
```

### POST `/api/auth/register`

Create a new user account.

**Request Body**

```json
{
  "email": "user@trackr.dev",
  "password": "password123",
  "name": "John Doe"
}
```

---

## 6. User

### GET `/api/me`

Returns the currently authenticated user.

**Response — 200**

```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "createdAt": "ISO-8601"
}
```

---

## 7. Workspaces

### GET `/api/workspaces`

List all workspaces the current user belongs to.

**Response — 200**

```json
[
  {
    "id": "uuid",
    "name": "Personal",
    "role": "OWNER"
  }
]
```

---

### POST `/api/workspaces`

Create a new workspace.
Automatically assigns the creator as **OWNER**.

**Request Body**

```json
{
  "name": "Personal"
}
```

**Response — 200**

```json
{
  "id": "uuid",
  "name": "Personal"
}
```

---

### GET `/api/workspaces/{id}`

Retrieve a workspace. User must be a member.

**Path Params**

| Name | Type   | Required |
| ---- | ------ | -------- |
| id   | string | yes      |

**Response — 200**

```json
{
  "id": "uuid",
  "name": "string"
}
```

---

## 8. Pipelines

### GET `/api/workspaces/{workspaceId}/pipelines`

List pipelines in a workspace.

**Path Params**

| Name        | Type   | Required |
| ----------- | ------ | -------- |
| workspaceId | string | yes      |

**Response — 200**

```json
[
  {
    "id": "uuid",
    "name": "Default",
    "isDefault": true
  }
]
```

---

### POST `/api/workspaces/{workspaceId}/pipelines`

Create a pipeline.

**Request Body**

```json
{
  "name": "Default",
  "createDefaultStages": true,
  "isDefault": false
}
```

**Response — 200**

```json
{
  "id": "uuid",
  "name": "Default"
}
```

---

### PATCH `/api/pipelines/{pipelineId}`

Update pipeline metadata.

**Request Body**

```json
{
  "name": "Renamed Pipeline",
  "isDefault": true
}
```

---

## 9. Stages

### GET `/api/pipelines/{pipelineId}/stages`

List stages in a pipeline.

**Response — 200**

```json
[
  {
    "id": "uuid",
    "name": "Screening",
    "color": "#4F46E5",
    "position": 1
  }
]
```

---

### POST `/api/pipelines/{pipelineId}/stages`

Create a stage.

**Request Body**

```json
{
  "name": "Screening",
  "color": "#4F46E5"
}
```

---

### PATCH `/api/pipelines/{pipelineId}/stages/reorder`

Reorder stages (transactional).

**Request Body**

```json
{
  "items": [
    {
      "stageId": "string",
      "position": 1
    }
  ]
}
```

---

## 10. Applications

### GET `/api/workspaces/{workspaceId}/applications`

List or search applications.

**Query Params**

| Name       | Type   | Description           |
| ---------- | ------ | --------------------- |
| pipelineId | string | Filter by pipeline    |
| stageId    | string | Filter by stage       |
| q          | string | Search company / role |

---

### POST `/api/workspaces/{workspaceId}/applications`

Create an application.

**Request Body**

```json
{
  "workspaceId": "string",
  "pipelineId": "string",
  "stageId": "string",
  "company": "ACME Corp",
  "role": "Software Engineer Intern",
  "link": "string",
  "source": "string",
  "location": "string",
  "compMin": 0,
  "compMax": 0,
  "priority": "LOW",
  "status": "ACTIVE",
  "position": 0
}
```

---

### PATCH `/api/applications/{id}`

Update application or move stages.

**Request Body**

```json
{
  "company": "string",
  "role": "string",
  "stageId": "string",
  "position": 0
}
```

---

### DELETE `/api/applications/{id}`

Soft delete an application.

**Response — 200**

```json
{}
```

---

## 11. Activities

### GET `/api/applications/{applicationId}/activities`

List activities for an application.

---

### POST `/api/applications/{applicationId}/activities`

Create a NOTE activity.

**Request Body**

```json
{
  "content": "Reached out to recruiter on LinkedIn"
}
```

---

## 12. Tasks

### GET `/api/workspaces/{workspaceId}/tasks`

List tasks.

**Query Params**

| Name      | Values               |
| --------- | -------------------- |
| status    | OPEN, DONE, CANCELED |
| dueBefore | ISO date             |

---

### POST `/api/applications/{applicationId}/tasks`

Create a task.

```json
{
  "title": "Follow up recruiter",
  "dueAt": "2026-01-20T09:00:00Z"
}
```

---

### PATCH `/api/tasks/{taskId}`

Update task.

```json
{
  "status": "OPEN",
  "dueAt": "2026-01-22T09:00:00Z",
  "title": "string"
}
```

---

## 13. Files

### POST `/api/files/upload-url`

Generate a presigned upload URL (R2).

```json
{
  "applicationId": "string",
  "filename": "resume.pdf",
  "contentType": "application/pdf",
  "size": 123456
}
```

---

### POST `/api/applications/{id}/files`

Register uploaded file metadata.

```json
{
  "name": "resume.pdf",
  "storageKey": "workspaces/<ws>/applications/<app>/uuid-resume.pdf",
  "mime": "application/pdf",
  "size": 123456
}
```

---

### GET `/api/applications/{id}/files`

List files for an application.

---

### GET `/api/files/{id}/download-url`

Generate a presigned download URL.

---

### DELETE `/api/files/{id}`

Soft delete file metadata.

**Response — 204**

---

## 14. Schemas (DTOs)

### LoginDto

```ts
email: string
password: string
```

### CreateWorkspaceDto

```ts
name: string
```

### CreatePipelineDto

```ts
name: string
createDefaultStages?: boolean
isDefault?: boolean
```

### CreateApplicationDto

```ts
workspaceId: string
pipelineId: string
stageId: string
company: string
role: string
priority?: "LOW" | "MEDIUM" | "HIGH"
status?: "ACTIVE" | "ARCHIVED"
```

### UpdateApplicationDto

Used when updating application details or moving an application between stages.

```ts
{
  company?: string
  role?: string
  link?: string
  source?: string
  location?: string
  compMin?: number
  compMax?: number
  priority?: "LOW" | "MEDIUM" | "HIGH"
  status?: "ACTIVE" | "ARCHIVED"
  stageId?: string
  position?: number
}
```

**Notes**

* `stageId` + `position` are used together for drag-and-drop stage movement
* Partial updates are supported
* All fields are optional

---

### CreateActivityDto

Used to create a NOTE activity for an application.

```ts
{
  content: string
}
```

**Notes**

* Creates an activity of type `NOTE`
* System-generated activity types (e.g. `STAGE_MOVED`) are not created via this DTO

---

### CreateTaskDto

Creates a task/reminder associated with an application.

```ts
{
  title: string
  dueAt?: string // ISO-8601 datetime
}
```

**Notes**

* `dueAt` is optional but recommended for reminders
* Tasks default to `OPEN` status

---

### UpdateTaskDto

Updates an existing task.

```ts
{
  status?: "OPEN" | "DONE" | "CANCELED"
  dueAt?: string // ISO-8601 datetime
  title?: string
}
```

**Notes**

* Partial updates supported
* Marking `status = DONE` completes the task

---

### CreateUploadUrlDto

Requests a presigned upload URL for file storage (Cloudflare R2).

```ts
{
  applicationId: string
  filename: string
  contentType: string
  size: number
}
```

**Notes**

* Returned URL is valid for a short duration
* Upload must be completed before file registration

---

### RegisterFileDto

Registers uploaded file metadata in the database.

```ts
{
  name: string
  storageKey: string
  mime: string
  size: number
}
```

**Notes**

* `storageKey` must match the key used during upload
* File is soft-deleted on removal

