import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Stage = { id: string; name: string; color: string; position: number };

export function useStages(pipelineId: string) {
  return useQuery({
    queryKey: ["stages", pipelineId],
    queryFn: () => api<Stage[]>(`/pipelines/${pipelineId}/stages`),
    enabled: !!pipelineId,
  });
}
