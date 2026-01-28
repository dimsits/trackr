import { api } from "@/lib/api";

export async function downloadFile(fileId: string) {
  const { url } = await api<{ url: string }>(`/files/${fileId}/download-url`);
  window.open(url, "_blank");
}
