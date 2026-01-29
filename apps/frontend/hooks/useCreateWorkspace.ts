"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export type WorkspaceListItem = {
  id: string;
  name: string;
  role: WorkspaceRole;
};

type CreateWorkspaceInput = { name: string };

// If backend returns only {id,name}, we'll handle it.
type CreateWorkspaceResponse =
  | { id: string; name: string; role: WorkspaceRole }
  | { id: string; name: string };

export function useCreateWorkspace() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWorkspaceInput) => {
      return api<CreateWorkspaceResponse>("/workspaces", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    onSuccess: async () => {
      // Membership-based list is the source of truth.
      await qc.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
