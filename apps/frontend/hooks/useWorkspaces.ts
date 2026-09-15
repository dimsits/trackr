"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Workspace } from "@/types";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api<Workspace[]>("/workspaces"),
  });
}
