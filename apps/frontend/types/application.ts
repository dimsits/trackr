export const APPLICATION_PRIORITIES = ["URGENT", "HIGH", "MEDIUM", "LOW"] as const;
export type ApplicationPriority = (typeof APPLICATION_PRIORITIES)[number];

export type ApplicationStatus = "ACTIVE" | "ON_HOLD" | "CLOSED";

/** Shape returned by `GET /workspaces/:id/applications`. */
export type Application = {
  id: string;
  workspaceId: string;
  pipelineId: string;
  stageId: string;
  company: string;
  role: string;
  link: string | null;
  source: string | null;
  location: string | null;
  /** Compensation bounds. The API stores integers without a currency. */
  compMin: number | null;
  compMax: number | null;
  priority: ApplicationPriority;
  status: ApplicationStatus;
  /** Ordering within a stage. */
  position: number;
  createdAt: string;
  updatedAt: string;
};
