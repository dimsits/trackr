import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Application } from "@/types";

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
