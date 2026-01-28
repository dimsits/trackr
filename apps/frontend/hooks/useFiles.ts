import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type FileItem = {
  id: string;
  name: string;
  size: number;
  mime: string;
};

export function useFiles(applicationId: string | null) {
  return useQuery({
    queryKey: ["files", applicationId],
    queryFn: () => api<FileItem[]>(`/applications/${applicationId}/files`),
    enabled: !!applicationId,
    staleTime: 60_000,
  });
}
