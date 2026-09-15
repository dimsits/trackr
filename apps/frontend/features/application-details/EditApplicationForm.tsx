"use client";

import { useEffect, useId, useRef, useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { PRIORITY_LABELS } from "@/features/board/PriorityBadge";
import { useUpdateApplication } from "@/hooks/useUpdateApplication";
import { getErrorMessage } from "@/lib/errors";
import { toSafeHref } from "@/lib/format";
import { APPLICATION_PRIORITIES, type Application, type ApplicationPriority } from "@/types";
import DeleteApplicationSection from "./DeleteApplicationSection";

type Props = {
  application: Application;
  onCancel: () => void;
  onSaved: () => void;
  onDeleted: () => void;
};

function parseAmount(value: string): number | null | "invalid" {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return "invalid";
  return Number(trimmed);
}

export default function EditApplicationForm({ application, onCancel, onSaved, onDeleted }: Props) {
  const updateM = useUpdateApplication(application.workspaceId, application.pipelineId);
  const formId = useId();
  const companyRef = useRef<HTMLInputElement | null>(null);

  // Move focus into the form when switching to edit mode.
  useEffect(() => {
    companyRef.current?.focus({ preventScroll: true });
  }, []);

  const [company, setCompany] = useState(application.company);
  const [role, setRole] = useState(application.role);
  const [priority, setPriority] = useState<ApplicationPriority>(application.priority);
  const [location, setLocation] = useState(application.location ?? "");
  const [source, setSource] = useState(application.source ?? "");
  const [link, setLink] = useState(application.link ?? "");
  const [compMin, setCompMin] = useState(application.compMin?.toString() ?? "");
  const [compMax, setCompMax] = useState(application.compMax?.toString() ?? "");
  const [showErrors, setShowErrors] = useState(false);

  const min = parseAmount(compMin);
  const max = parseAmount(compMax);
  const trimmedLink = link.trim();
  const errors = {
    company: company.trim() ? null : "Company can't be empty.",
    role: role.trim() ? null : "Role can't be empty.",
    link: trimmedLink && !toSafeHref(trimmedLink) ? "Enter a full web address, like https://careers.example.com." : null,
    compMin: min === "invalid" ? "Use whole numbers only." : null,
    compMax:
      max === "invalid"
        ? "Use whole numbers only."
        : typeof min === "number" && typeof max === "number" && max < min
          ? "Maximum should be at least the minimum."
          : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setShowErrors(true);
    if (hasErrors || min === "invalid" || max === "invalid") return;

    try {
      await updateM.mutateAsync({
        id: application.id,
        data: {
          company: company.trim(),
          role: role.trim(),
          priority,
          // Empty optional fields are cleared rather than left unchanged.
          location: location.trim() || null,
          source: source.trim() || null,
          link: trimmedLink || null,
          compMin: min,
          compMax: max,
        },
      });
      onSaved();
    } catch {
      // Surfaced through updateM.error below.
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scrollbar-calm relative min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <form id={formId} onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <h3 className="text-sm font-bold text-text sm:col-span-2">Edit details</h3>

          <Field label="Company" required error={showErrors && errors.company} className="sm:col-span-2">
            <Input
              ref={companyRef}
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              maxLength={120}
              autoComplete="organization"
            />
          </Field>

          <Field label="Role" required error={showErrors && errors.role} className="sm:col-span-2">
            <Input value={role} onChange={(event) => setRole(event.target.value)} maxLength={120} autoComplete="off" />
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
            <Input value={location} onChange={(event) => setLocation(event.target.value)} maxLength={120} />
          </Field>

          <Field label="Source" optional hint="Where you found it, e.g. LinkedIn or a referral.">
            <Input value={source} onChange={(event) => setSource(event.target.value)} maxLength={120} />
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

          <fieldset className="grid grid-cols-2 gap-3 sm:col-span-2">
            <legend className="mb-1.5 text-[13px] font-semibold text-text">
              Compensation <span className="text-xs font-medium text-text-muted">Optional</span>
            </legend>
            <Field label="Minimum" error={showErrors && errors.compMin}>
              <Input
                inputMode="numeric"
                value={compMin}
                onChange={(event) => setCompMin(event.target.value)}
                placeholder="e.g. 18000"
              />
            </Field>
            <Field label="Maximum" error={showErrors && errors.compMax}>
              <Input
                inputMode="numeric"
                value={compMax}
                onChange={(event) => setCompMax(event.target.value)}
                placeholder="e.g. 25000"
              />
            </Field>
            <p className="col-span-2 -mt-1 text-xs text-text-muted">
              Whole numbers in whatever unit you track. Trackr doesn&apos;t assume a currency.
            </p>
          </fieldset>

          {updateM.isError && (
            <Alert className="sm:col-span-2">
              {getErrorMessage(updateM.error, "We couldn't save your changes. Try again.")}
            </Alert>
          )}
        </form>

        <div className="mt-8 border-t border-border pt-6">
          <DeleteApplicationSection application={application} onDeleted={onDeleted} />
        </div>
      </div>

      <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end sm:px-6 sm:pb-4">
        <Button variant="secondary" onClick={onCancel} disabled={updateM.isPending}>
          Cancel
        </Button>
        <Button type="submit" form={formId} loading={updateM.isPending}>
          {updateM.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
