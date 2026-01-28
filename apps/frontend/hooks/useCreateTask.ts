import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCreateTask(applicationId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (title: string) =>
      api(`/applications/${applicationId}/tasks`, {
        method: "POST",
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", applicationId] });
    },
  });
}
