import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Task = {
  id: string;
  title: string;
  status: "OPEN" | "DONE";
  dueAt?: string | null;
};

export function useTasks(applicationId: string | null) {
  return useQuery({
    queryKey: ["tasks", applicationId],
    queryFn: () =>
      api<Task[]>(`/applications/${applicationId}/tasks`),
    enabled: !!applicationId,
    staleTime: 60_000,
  });
}
