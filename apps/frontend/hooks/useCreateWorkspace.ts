"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Workspace } from "@/types";

type CreateWorkspaceInput = { name: string };

export function useCreateWorkspace() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWorkspaceInput) => {
      return api<Workspace>("/workspaces", {
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
