import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useUploadFile(applicationId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // 1) request upload URL
      const upload = await api<{
        uploadUrl: string;
        storageKey: string;
      }>("/files/upload-url", {
        method: "POST",
        body: JSON.stringify({
          applicationId,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      // 2) upload to storage
      const res = await fetch(upload.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("Upload failed");

      // 3) register file
      await api(`/applications/${applicationId}/files`, {
        method: "POST",
        body: JSON.stringify({
          name: file.name,
          storageKey: upload.storageKey,
          mime: file.type,
          size: file.size,
        }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files", applicationId] });
    },
  });
}
