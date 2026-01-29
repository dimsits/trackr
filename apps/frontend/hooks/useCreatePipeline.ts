"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type CreatePipelineInput = {
  workspaceId: string;
  name: string;
  createDefaultStages?: boolean;
  isDefault?: boolean;
};

type CreatePipelineResponse = { id: string; name: string };

export function useCreatePipeline() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePipelineInput) => {
      const { workspaceId, ...body } = input;
      return api<CreatePipelineResponse>(`/workspaces/${workspaceId}/pipelines`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: async (_res, vars) => {
      // refresh pipelines list for that workspace
      await qc.invalidateQueries({ queryKey: ["pipelines", vars.workspaceId] });
    },
  });
}
