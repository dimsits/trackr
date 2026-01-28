import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Task = {
  id: string;
  title: string;
  status: "OPEN" | "DONE";
  dueAt?: string | null;
};

export function useTasks(workspaceId: string | null) {
  return useQuery({
    queryKey: ["tasks", workspaceId],
    queryFn: () => api<Task[]>(`/workspaces/${workspaceId}/tasks`),
    enabled: !!workspaceId,
    staleTime: 60_000,
  });
}
