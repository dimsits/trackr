"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { WorkspaceListItem } from "./useCreateWorkspace";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api<WorkspaceListItem[]>("/workspaces"),
  });
}
