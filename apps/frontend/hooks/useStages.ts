import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Stage } from "@/types";

export function useStages(pipelineId: string) {
  return useQuery({
    queryKey: ["stages", pipelineId],
    queryFn: () => api<Stage[]>(`/pipelines/${pipelineId}/stages`),
    enabled: !!pipelineId,
  });
}
