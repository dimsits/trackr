/**
 * Shape returned by `GET /workspaces` and `POST /workspaces`.
 * The list is membership-scoped; the API does not expose the caller's
 * membership role, so ownership is derived from `ownerId`.
 */
export type Workspace = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};
