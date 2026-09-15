export type ActivityType =
  | "NOTE"
  | "STAGE_MOVED"
  | "INTERVIEW"
  | "EMAIL"
  | "CALL"
  | "OFFER";

export type Activity = {
  id: string;
  applicationId: string;
  type: ActivityType;
  /** Free text. `null` for system events such as stage moves. */
  content: string | null;
  /** Structured payload, e.g. `{ fromStageId, toStageId }` for stage moves. */
  data: unknown;
  createdById: string | null;
  createdAt: string;
};
