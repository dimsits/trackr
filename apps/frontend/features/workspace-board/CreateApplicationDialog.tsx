"use client";

import { useId, useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { PRIORITY_LABELS } from "@/features/board/PriorityBadge";
import { useCreateApplication } from "@/hooks/useCreateApplication";
import { getErrorMessage } from "@/lib/errors";
import { toSafeHref } from "@/lib/format";
import { APPLICATION_PRIORITIES, type ApplicationPriority, type Stage } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  pipelineId: string;
  stages: Stage[];
};

/** Mount with a fresh `key` per opening so the form starts empty. */
export default function CreateApplicationDialog({ open, onClose, workspaceId, pipelineId, stages }: Props) {
  const createM = useCreateApplication(workspaceId, pipelineId);
  const formId = useId();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [stageId, setStageId] = useState(stages[0]?.id ?? "");
  const [priority, setPriority] = useState<ApplicationPriority>("MEDIUM");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const trimmedLink = link.trim();
  const errors = {
    company: company.trim() ? null : "Enter the company name.",
    role: role.trim() ? null : "Enter the role you applied for.",
    link: trimmedLink && !toSafeHref(trimmedLink) ? "Enter a full web address, like https://careers.example.com." : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleClose() {
    if (createM.isPending) return;
    onClose();
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setShowErrors(true);
    if (hasErrors || !stageId) return;

    try {
      await createM.mutateAsync({
        stageId,
        company: company.trim(),
        role: role.trim(),
        priority,
        location: location.trim() || undefined,
        link: trimmedLink || undefined,
      });
      onClose();
    } catch {
      // Surfaced through createM.error below.
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Add application"
      description="Capture the essentials now. You can add notes, tasks and files from the application's details."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={createM.isPending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={createM.isPending}>
            {createM.isPending ? "Adding…" : "Add application"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" required error={showErrors && errors.company} className="sm:col-span-2">
          <Input
            data-autofocus
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="e.g. Northfield Labs"
            maxLength={120}
            autoComplete="organization"
          />
        </Field>

        <Field label="Role" required error={showErrors && errors.role} className="sm:col-span-2">
          <Input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="e.g. Frontend Engineering Intern"
            maxLength={120}
            autoComplete="off"
          />
        </Field>

        <Field label="Stage">
          <Select value={stageId} onChange={(event) => setStageId(event.target.value)}>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Priority">
          <Select value={priority} onChange={(event) => setPriority(event.target.value as ApplicationPriority)}>
            {APPLICATION_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {PRIORITY_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Location" optional>
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Remote, Makati"
            maxLength={120}
          />
        </Field>

        <Field label="Posting link" optional error={showErrors && errors.link}>
          <Input
            type="url"
            inputMode="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://"
            autoComplete="url"
          />
        </Field>

        {createM.isError && (
          <Alert className="sm:col-span-2">
            {getErrorMessage(createM.error, "We couldn't add that application. Try again.")}
          </Alert>
        )}
      </form>
    </Dialog>
  );
}
