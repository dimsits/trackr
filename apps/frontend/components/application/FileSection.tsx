"use client";

import DrawerSection from "./DrawerSection";
import { useFiles } from "@/hooks/useFiles";
import { useUploadFile } from "@/hooks/useUploadFile";
import { downloadFile } from "@/hooks/useDownloadFile";
import { useState } from "react";

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

  const [downloadErr, setDownloadErr] = useState<string | null>(null);


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
            <button
            className="underline"
            onClick={async () => {
                try {
                setDownloadErr(null);
                await downloadFile(f.id);
                } catch (e: any) {
                setDownloadErr(e?.message ?? "Download failed");
                }
            }}
            >
                {f.name}
            </button>

          ))}
        </div>
      )}

      {downloadErr && <div className="text-sm text-red-600">{downloadErr}</div>}

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
