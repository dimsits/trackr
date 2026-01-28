import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Activity = {
  id: string;
  content: string;
  createdAt: string;
};

export function useActivities(applicationId: string | null) {
  return useQuery({
    queryKey: ["activities", applicationId],
    queryFn: () =>
      api<Activity[]>(`/applications/${applicationId}/activities`),
    enabled: !!applicationId,
    staleTime: 60_000,
  });
}
