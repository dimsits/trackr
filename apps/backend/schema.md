generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

//// ENUMS

enum WorkspaceRole {
  OWNER
  ADMIN
  MEMBER
}

enum ApplicationPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ApplicationStatus {
  ACTIVE
  ON_HOLD
  CLOSED
}

enum ActivityType {
  NOTE
  STAGE_MOVED
  INTERVIEW
  EMAIL
  CALL
  OFFER
}

enum TaskStatus {
  OPEN
  DONE
  CANCELED
}

//// MODELS

model User {
  id       String  @id @default(cuid())
  name     String?
  email    String  @unique
  hashedPw String? @map("hashed_pw") // optional if you later use OAuth/magic links

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // relations
  ownedWorkspaces Workspace[]  @relation("WorkspaceOwner")
  memberships     Membership[]
  activities      Activity[]   @relation("ActivityCreatedBy")

  @@index([deletedAt])
}

model Workspace {
  id   String @id @default(cuid())
  name String

  // README mentions owner_id — we keep it as a convenience,
  // but real authorization should still use Membership.
  ownerId String @map("owner_id")
  owner   User   @relation("WorkspaceOwner", fields: [ownerId], references: [id], onDelete: Restrict)

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // relations
  memberships  Membership[]
  pipelines    Pipeline[]
  applications Application[]
  tasks        Task[]
  files        File[]

  @@index([ownerId])
  @@index([deletedAt])
}

model Membership {
  id          String        @id @default(cuid())
  workspaceId String        @map("workspace_id")
  userId      String        @map("user_id")
  role        WorkspaceRole @default(MEMBER)

  createdAt DateTime  @default(now()) @map("created_at")
  deletedAt DateTime? @map("deleted_at")

  // relations
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // one membership per user per workspace
  @@unique([workspaceId, userId])
  @@index([userId])
  @@index([workspaceId])
  @@index([deletedAt])
}

model Pipeline {
  id          String  @id @default(cuid())
  workspaceId String  @map("workspace_id")
  name        String
  isDefault   Boolean @default(false) @map("is_default")

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // relations
  workspace    Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  stages       Stage[]
  applications Application[]

  @@index([workspaceId])
  @@index([deletedAt])
}

model Stage {
  id         String  @id @default(cuid())
  pipelineId String  @map("pipeline_id")
  name       String
  position   Int // ordering is controlled by position
  color      String? // optional hex, e.g. "#4F46E5"

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // relations
  pipeline     Pipeline      @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  applications Application[]

  // enforce deterministic ordering inside a pipeline
  @@unique([pipelineId, position])
  @@index([pipelineId])
  @@index([deletedAt])
}

model Application {
  id          String @id @default(cuid())
  workspaceId String @map("workspace_id")
  pipelineId  String @map("pipeline_id")
  stageId     String @map("stage_id")

  company  String
  role     String
  link     String?
  source   String?
  location String?

  compMin Int? @map("comp_min")
  compMax Int? @map("comp_max")

  priority ApplicationPriority @default(MEDIUM)
  status   ApplicationStatus   @default(ACTIVE)

  // ordering within a stage for drag/drop
  position Int @default(0)

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // relations
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  pipeline  Pipeline  @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  stage     Stage     @relation(fields: [stageId], references: [id], onDelete: Restrict)

  activities Activity[]
  tasks      Task[]
  files      File[]

  @@index([workspaceId])
  @@index([pipelineId])
  @@index([stageId])
  @@index([workspaceId, pipelineId, stageId])
  @@index([deletedAt])
}

model Activity {
  id            String @id @default(cuid())
  applicationId String @map("application_id")

  type    ActivityType
  content String? // note text, summary, etc.
  data    Json? // structured payload (e.g., fromStageId/toStageId)

  createdAt DateTime @default(now()) @map("created_at")

  createdById String? @map("created_by")
  createdBy   User?   @relation("ActivityCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)

  // relations
  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@index([applicationId, createdAt])
  @@index([createdById])
}

model Task {
  id            String  @id @default(cuid())
  workspaceId   String  @map("workspace_id")
  applicationId String? @map("application_id")

  title  String
  dueAt  DateTime?  @map("due_at")
  status TaskStatus @default(OPEN)

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // relations
  workspace   Workspace    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  application Application? @relation(fields: [applicationId], references: [id], onDelete: SetNull)

  @@index([workspaceId])
  @@index([applicationId])
  @@index([dueAt])
  @@index([status])
  @@index([deletedAt])
}

model File {
  id            String  @id @default(cuid())
  workspaceId   String  @map("workspace_id")
  applicationId String? @map("application_id")

  name       String
  storageKey String? @map("storage_key")
  mime       String? @map("mime")
  size       Int?    @map("size")

  createdAt DateTime  @default(now()) @map("created_at")
  deletedAt DateTime? @map("deleted_at")

  // relations
  workspace   Workspace    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  application Application? @relation(fields: [applicationId], references: [id], onDelete: SetNull)

  @@index([workspaceId])
  @@index([applicationId])
  @@index([deletedAt])
}
