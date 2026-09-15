export type Pipeline = {
  id: string;
  workspaceId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Stage = {
  id: string;
  pipelineId: string;
  name: string;
  /** Optional hex colour chosen when the stage was created, e.g. "#4F46E5". */
  color: string | null;
  position: number;
};
