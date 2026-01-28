import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useUpdateApplication(workspaceId: string, pipelineId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { id: string; data: Record<string, unknown> }) => {
      return api(`/applications/${args.id}`, {
        method: "PATCH",
        body: JSON.stringify(args.data),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["applications", workspaceId, pipelineId] });
    },
  });
}
