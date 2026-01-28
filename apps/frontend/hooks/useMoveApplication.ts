import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Uses PATCH /api/applications/{id} with stageId + position. :contentReference[oaicite:4]{index=4}
export function useMoveApplication(workspaceId: string, pipelineId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { id: string; stageId: string; position: number }) => {
      return api(`/applications/${args.id}`, {
        method: "PATCH",
        body: JSON.stringify({ stageId: args.stageId, position: args.position }),
      });
    },
    onSettled: async () => {
      // Always refetch truth after optimistic move
      await qc.invalidateQueries({ queryKey: ["applications", workspaceId, pipelineId] });
    },
  });
}
