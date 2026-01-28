import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Workspace = { id: string; name: string; role: string };

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api<Workspace[]>("/workspaces"),
  });
}
