import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type CreateApplicationInput = {
  workspaceId: string;
  pipelineId: string;
  stageId: string;
  company: string;
  role: string;
};

export function useCreateApplication(workspaceId: string, pipelineId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<CreateApplicationInput, "workspaceId" | "pipelineId">) => {
      return api(`/workspaces/${workspaceId}/applications`, {
        method: "POST",
        body: JSON.stringify({
          workspaceId,
          pipelineId,
          stageId: input.stageId,
          company: input.company,
          role: input.role,
          position: 0,
        }),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["applications", workspaceId, pipelineId] });
    },
  });
}
