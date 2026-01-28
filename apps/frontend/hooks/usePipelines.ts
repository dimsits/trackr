import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Pipeline = { id: string; name: string; isDefault: boolean };

export function usePipelines(workspaceId: string) {
  return useQuery({
    queryKey: ["pipelines", workspaceId],
    queryFn: () => api<Pipeline[]>(`/workspaces/${workspaceId}/pipelines`),
    enabled: !!workspaceId,
  });
}
