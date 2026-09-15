import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TaskStatus } from "@/types";

export function useUpdateTask(applicationId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (args: { id: string; status: TaskStatus }) =>
      api(`/tasks/${args.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: args.status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", applicationId] });
    },
  });
}
