import { api } from "@/lib/api";

export async function downloadFile(fileId: string) {
  const { downloadUrl } = await api<{ downloadUrl: string }>(
    `/files/${fileId}/download-url`
  );

  if (!downloadUrl) {
    throw new Error("Download URL missing");
  }

  // Use anchor click (more reliable than window.open)
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.target = "_blank";
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
