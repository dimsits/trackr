import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Application = {
  id: string;
  company: string;
  role: string;
  stageId: string;
  position: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "ACTIVE" | "ARCHIVED";
};

export function useApplications(workspaceId: string, pipelineId: string) {
  return useQuery({
    queryKey: ["applications", workspaceId, pipelineId],
    queryFn: () =>
      api<Application[]>(
        `/workspaces/${workspaceId}/applications?pipelineId=${encodeURIComponent(pipelineId)}`
      ),
    enabled: !!workspaceId && !!pipelineId,
  });
}
