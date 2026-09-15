"use client";

import { Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { useDeleteApplication } from "@/hooks/useDeleteApplication";
import { getErrorMessage } from "@/lib/errors";
import type { Application } from "@/types";

export default function DeleteApplicationSection({
  application,
  onDeleted,
}: {
  application: Application;
  onDeleted: () => void;
}) {
  const deleteM = useDeleteApplication(application.workspaceId, application.pipelineId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const headingId = useId();

  function close() {
    if (deleteM.isPending) return;
    setConfirmOpen(false);
    deleteM.reset();
  }

  async function confirmDelete() {
    try {
      await deleteM.mutateAsync(application.id);
      setConfirmOpen(false);
      onDeleted();
    } catch {
      // Surfaced in the dialog.
    }
  }

  return (
    <section aria-labelledby={headingId} className="rounded-card border border-danger/25 bg-danger-soft/40 p-4">
      <h3 id={headingId} className="text-sm font-bold text-danger-ink">
        Delete application
      </h3>
      <p className="mt-1 text-[13px] leading-5 text-text-muted">
        Removes it from this board along with its place in the pipeline.
      </p>
      <Button variant="danger-ghost" size="sm" className="mt-3 -ml-2" onClick={() => setConfirmOpen(true)}>
        <Trash2 aria-hidden="true" />
        Delete application…
      </Button>

      <Dialog
        open={confirmOpen}
        onClose={close}
        role="alertdialog"
        size="sm"
        initialFocusRef={cancelRef}
        hideClose={deleteM.isPending}
        title="Delete this application?"
        description={
          <>
            <span className="font-semibold text-text [overflow-wrap:anywhere]">
              {application.role} at {application.company}
            </span>{" "}
            will be removed from your board. You can&apos;t undo this from Trackr.
          </>
        }
        footer={
          <>
            <Button ref={cancelRef} variant="secondary" onClick={close} disabled={deleteM.isPending}>
              Keep application
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleteM.isPending}>
              {deleteM.isPending ? "Deleting…" : "Delete application"}
            </Button>
          </>
        }
      >
        {deleteM.isError ? (
          <Alert>{getErrorMessage(deleteM.error, "We couldn't delete this application. Try again.")}</Alert>
        ) : null}
      </Dialog>
    </section>
  );
}
