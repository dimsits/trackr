"use client";

import { useId, useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import { useCreateWorkspace } from "@/hooks/useCreateWorkspace";
import { getErrorMessage } from "@/lib/errors";
import type { Workspace } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (workspace: Workspace) => void;
};

export default function CreateWorkspaceDialog({ open, onClose, onCreated }: Props) {
  const createM = useCreateWorkspace();
  const [name, setName] = useState("");
  const formId = useId();
  const trimmed = name.trim();

  function handleClose() {
    if (createM.isPending) return;
    setName("");
    createM.reset();
    onClose();
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!trimmed) return;
    try {
      const workspace = await createM.mutateAsync({ name: trimmed });
      setName("");
      onCreated(workspace);
    } catch {
      // Surfaced through createM.error below.
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      size="sm"
      title="Create a workspace"
      description="A workspace keeps its own pipelines and applications, like one for your internship search and one for full-time roles."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={createM.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={createM.isPending} disabled={!trimmed}>
            {createM.isPending ? "Creating…" : "Create workspace"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} className="space-y-4">
        <Field label="Workspace name" required>
          <Input
            data-autofocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Internship search 2026"
            maxLength={80}
            autoComplete="off"
          />
        </Field>
        {createM.isError && (
          <Alert>{getErrorMessage(createM.error, "We couldn't create that workspace. Try again.")}</Alert>
        )}
      </form>
    </Dialog>
  );
}
