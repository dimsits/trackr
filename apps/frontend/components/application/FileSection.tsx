"use client";

import DrawerSection from "./DrawerSection";
import { useFiles } from "@/hooks/useFiles";
import { useUploadFile } from "@/hooks/useUploadFile";
import { downloadFile } from "@/hooks/useDownloadFile";

export default function FilesSection({
  applicationId,
}: {
  applicationId: string;
}) {
  const { data, isLoading, isError } = useFiles(applicationId);
  const uploadM = useUploadFile(applicationId);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadM.mutate(file);
    e.target.value = "";
  }

  return (
    <DrawerSection title="Files">
      {isLoading && <div className="text-sm">Loading…</div>}
      {isError && (
        <div className="text-sm text-red-600">
          Failed to load files
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-2">
          {data?.length === 0 && (
            <div className="text-sm opacity-60">No files</div>
          )}

          {data?.map((f) => (
            <div key={f.id} className="flex justify-between text-sm">
              <button
                className="underline"
                onClick={() => downloadFile(f.id)}
              >
                {f.name}
              </button>
              <span className="opacity-50">
                {(f.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
        </div>
      )}

      {/* upload */}
      <div className="mt-3">
        <input
          type="file"
          disabled={uploadM.isPending}
          onChange={onSelect}
        />
        {uploadM.isPending && (
          <div className="text-sm mt-1">Uploading…</div>
        )}
        {(uploadM.error as any)?.message && (
          <div className="text-sm text-red-600">
            {(uploadM.error as any).message}
          </div>
        )}
      </div>
    </DrawerSection>
  );
}
