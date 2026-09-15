import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Pipeline } from "@/types";

export function usePipelines(workspaceId: string) {
  return useQuery({
    queryKey: ["pipelines", workspaceId],
    queryFn: () => api<Pipeline[]>(`/workspaces/${workspaceId}/pipelines`),
    enabled: !!workspaceId,
  });
}
