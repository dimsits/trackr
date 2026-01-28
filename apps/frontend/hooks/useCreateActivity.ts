import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCreateActivity(applicationId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      api(`/applications/${applicationId}/activities`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["activities", applicationId],
      });
    },
  });
}
