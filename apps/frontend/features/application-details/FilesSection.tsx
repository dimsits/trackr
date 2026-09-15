"use client";

import { Download, File, FileArchive, FileImage, FileText, Paperclip, Upload } from "lucide-react";
import { useRef, useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { downloadFile } from "@/hooks/useDownloadFile";
import { useFiles } from "@/hooks/useFiles";
import { useUploadFile } from "@/hooks/useUploadFile";
import { getErrorMessage } from "@/lib/errors";
import { formatDate, formatFileSize } from "@/lib/format";
import type { FileItem } from "@/types";
import { SectionError, SectionLoading } from "./SectionStates";

function FileIcon({ mime }: { mime: string | null }) {
  if (mime?.startsWith("image/")) return <FileImage />;
  if (mime && /zip|compressed|tar|rar/.test(mime)) return <FileArchive />;
  if (mime && /pdf|text|word|document|rtf/.test(mime)) return <FileText />;
  return <File />;
}

export default function FilesSection({ applicationId }: { applicationId: string }) {
  const filesQ = useFiles(applicationId);
  const uploadM = useUploadFile(applicationId);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  function onSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    uploadM.mutate(file);
  }

  async function onDownload(file: FileItem) {
    setDownloadError(null);
    setDownloadingId(file.id);
    try {
      await downloadFile(file.id);
    } catch (error) {
      setDownloadError(`We couldn't download ${file.name}. ${getErrorMessage(error, "")}`.trim());
    } finally {
      setDownloadingId(null);
    }
  }

  const files = filesQ.data ?? [];
  const uploadingName = uploadM.variables?.name;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-card border border-dashed border-border-strong bg-surface-muted/50 p-4 sm:flex-row sm:items-center">
        <span
          aria-hidden="true"
          className="hidden size-10 shrink-0 items-center justify-center rounded-card bg-surface text-brand shadow-xs sm:flex"
        >
          <Paperclip className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text">Attach a file</p>
          <p className="text-xs leading-5 text-text-muted">Résumés, cover letters, offer letters or screenshots.</p>
        </div>
        <input ref={inputRef} type="file" hidden tabIndex={-1} onChange={onSelect} disabled={uploadM.isPending} />
        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          loading={uploadM.isPending}
          className="sm:self-center"
        >
          {!uploadM.isPending && <Upload aria-hidden="true" />}
          {uploadM.isPending ? "Uploading…" : "Choose file"}
        </Button>
      </div>

      <div aria-live="polite" className="empty:hidden">
        {uploadM.isPending && uploadingName && (
          <p className="text-[13px] text-text-muted">
            Uploading <span className="font-semibold text-text">{uploadingName}</span>…
          </p>
        )}
        {uploadM.isSuccess && uploadingName && (
          <p className="text-[13px] text-brand-ink">
            Uploaded <span className="font-semibold">{uploadingName}</span>.
          </p>
        )}
      </div>

      {uploadM.isError && (
        <Alert title="Upload failed">{getErrorMessage(uploadM.error, "We couldn't upload that file. Try again.")}</Alert>
      )}
      {downloadError && <Alert>{downloadError}</Alert>}

      {filesQ.isLoading ? (
        <SectionLoading label="Loading files" rows={2} />
      ) : filesQ.isError ? (
        <SectionError
          message="We couldn't load the files for this application."
          onRetry={() => filesQ.refetch()}
          retrying={filesQ.isFetching}
        />
      ) : files.length === 0 ? (
        <EmptyState
          variant="inline"
          headingLevel="h3"
          icon={<FileText />}
          title="No files attached"
          description="Keep the version of your résumé you sent, next to the application it went with."
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
          {files.map((file) => {
            const size = formatFileSize(file.size);
            const downloading = downloadingId === file.id;
            return (
              <li key={file.id} className="flex items-center gap-3 px-3 py-2.5">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-muted [&_svg]:size-[18px]"
                >
                  <FileIcon mime={file.mime} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text" title={file.name}>
                    {file.name}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {[size, `Added ${formatDate(file.createdAt)}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownload(file)}
                  loading={downloading}
                  aria-label={downloading ? `Preparing ${file.name}` : `Download ${file.name}`}
                >
                  {!downloading && <Download aria-hidden="true" />}
                  <span className="max-sm:sr-only">{downloading ? "Preparing…" : "Download"}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
