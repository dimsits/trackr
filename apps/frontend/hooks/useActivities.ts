import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Activity } from "@/types";

export function useActivities(applicationId: string | null) {
  return useQuery({
    queryKey: ["activities", applicationId],
    queryFn: () =>
      api<Activity[]>(`/applications/${applicationId}/activities`),
    enabled: !!applicationId,
    staleTime: 60_000,
  });
}
