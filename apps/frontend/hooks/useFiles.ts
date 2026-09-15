import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FileItem } from "@/types";

export function useFiles(applicationId: string | null) {
  return useQuery({
    queryKey: ["files", applicationId],
    queryFn: () => api<FileItem[]>(`/applications/${applicationId}/files`),
    enabled: !!applicationId,
    staleTime: 60_000,
  });
}
