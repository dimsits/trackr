import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApplicationPriority } from "@/types";

/** Editable fields. `null` clears an optional value. */
export type ApplicationPatch = {
  company?: string;
  role?: string;
  link?: string | null;
  source?: string | null;
  location?: string | null;
  compMin?: number | null;
  compMax?: number | null;
  priority?: ApplicationPriority;
};

export function useUpdateApplication(workspaceId: string, pipelineId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { id: string; data: ApplicationPatch }) => {
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
