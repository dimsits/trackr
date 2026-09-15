import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApplicationPriority } from "@/types";

export type CreateApplicationInput = {
  stageId: string;
  company: string;
  role: string;
  priority?: ApplicationPriority;
  location?: string;
  link?: string;
};

export function useCreateApplication(workspaceId: string, pipelineId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateApplicationInput) => {
      return api(`/workspaces/${workspaceId}/applications`, {
        method: "POST",
        body: JSON.stringify({
          workspaceId,
          pipelineId,
          ...input,
          position: 0,
        }),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["applications", workspaceId, pipelineId] });
    },
  });
}
