import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Task } from "@/types";

export function useTasks(applicationId: string | null) {
  return useQuery({
    queryKey: ["tasks", applicationId],
    queryFn: () =>
      api<Task[]>(`/applications/${applicationId}/tasks`),
    enabled: !!applicationId,
    staleTime: 60_000,
  });
}
