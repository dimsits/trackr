"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Dialog from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import IconButton from "@/components/ui/IconButton";
import Menu, { MenuItem } from "@/components/ui/Menu";
import { STAGE_COLOR_PRESETS } from "@/features/board/stageColors";
import { useCreatePipeline } from "@/hooks/useCreatePipeline";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/errors";

const STANDARD_STAGES = ["Interested", "Applied", "Interview", "Offer", "Rejected"];

type StageDraft = { key: number; name: string; color: string };

type Props = {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  onCreated: (pipelineId: string) => void;
};

/** Mount with a fresh `key` per opening so the form starts empty. */
export default function CreatePipelineDialog({ open, onClose, workspaceId, onCreated }: Props) {
  const createPipeline = useCreatePipeline();
  const formId = useId();

  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [stageMode, setStageMode] = useState<"standard" | "custom">("standard");
  const [stages, setStages] = useState<StageDraft[]>(() =>
    STANDARD_STAGES.map((stageName, index) => ({
      key: index,
      name: stageName,
      color: STAGE_COLOR_PRESETS[index % STAGE_COLOR_PRESETS.length].value,
    }))
  );
  const nextKey = useRef(STANDARD_STAGES.length);
  const [creatingStages, setCreatingStages] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);
  const [orphanPipelineId, setOrphanPipelineId] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const submitting = createPipeline.isPending || creatingStages;
  const namedStages = stages.filter((stage) => stage.name.trim());
  const nameError = name.trim() ? null : "Give the pipeline a name.";
  const stagesError = stageMode === "custom" && namedStages.length === 0 ? "Add at least one stage." : null;

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  function updateStage(key: number, patch: Partial<StageDraft>) {
    setStages((prev) => prev.map((stage) => (stage.key === key ? { ...stage, ...patch } : stage)));
  }

  function addStage() {
    const key = nextKey.current;
    nextKey.current += 1;
    setStages((prev) => [
      ...prev,
      { key, name: "", color: STAGE_COLOR_PRESETS[prev.length % STAGE_COLOR_PRESETS.length].value },
    ]);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setShowErrors(true);
    setStageError(null);
    if (nameError || stagesError) return;

    let pipelineId: string;
    try {
      const pipeline = await createPipeline.mutateAsync({
        workspaceId,
        name: name.trim(),
        isDefault,
        // Custom stages replace the standard set.
        createDefaultStages: stageMode === "standard",
      });
      pipelineId = pipeline.id;
    } catch {
      return; // Surfaced through createPipeline.error.
    }

    if (stageMode === "custom") {
      setCreatingStages(true);
      try {
        for (const stage of namedStages) {
          await api(`/pipelines/${pipelineId}/stages`, {
            method: "POST",
            body: JSON.stringify({ name: stage.name.trim(), color: stage.color }),
          });
        }
      } catch (error) {
        setCreatingStages(false);
        setOrphanPipelineId(pipelineId);
        setStageError(getErrorMessage(error, "Some stages couldn't be added."));
        return;
      }
      setCreatingStages(false);
    }

    onCreated(pipelineId);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      size="lg"
      title="Create pipeline"
      description="Pipelines hold the stages your applications move through. Use one per search, like internships or full-time roles."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={submitting} disabled={Boolean(orphanPipelineId)}>
            {submitting ? "Creating…" : "Create pipeline"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="space-y-5">
        <Field label="Pipeline name" required error={showErrors && nameError}>
          <Input
            data-autofocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Internships 2026"
            maxLength={80}
            autoComplete="off"
            disabled={submitting}
          />
        </Field>

        <Checkbox
          checked={isDefault}
          onChange={(event) => setIsDefault(event.target.checked)}
          disabled={submitting}
          label="Make this the default pipeline"
          description="The default opens first when you visit this workspace."
        />

        <fieldset className="space-y-2.5">
          <legend className="text-[13px] font-semibold text-text">Stages</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                { value: "standard", title: "Standard stages", body: STANDARD_STAGES.join(" · ") },
                { value: "custom", title: "My own stages", body: "Name, order and colour each stage." },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-card border p-3 transition-colors duration-150",
                  stageMode === option.value
                    ? "border-brand bg-brand-soft/60"
                    : "border-border hover:border-border-strong"
                )}
              >
                <input
                  type="radio"
                  name={`${formId}-stage-mode`}
                  value={option.value}
                  checked={stageMode === option.value}
                  onChange={() => setStageMode(option.value)}
                  disabled={submitting}
                  className="mt-1 size-4 shrink-0 accent-brand"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-text">{option.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-text-muted">{option.body}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {stageMode === "custom" && (
          <div className="space-y-2 rounded-card border border-border bg-surface-muted/60 p-3">
            <ol className="space-y-2">
              {stages.map((stage, index) => {
                const preset = STAGE_COLOR_PRESETS.find((option) => option.value === stage.color);
                return (
                  <li key={stage.key} className="flex items-center gap-2">
                    <span aria-hidden="true" className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-text-muted">
                      {index + 1}
                    </span>
                    <Menu
                      align="start"
                      menuClassName="w-48"
                      trigger={(props) => (
                        <button
                          {...props}
                          type="button"
                          disabled={submitting}
                          aria-label={`Colour for stage ${index + 1}: ${preset?.name ?? "Custom"}`}
                          className="flex size-11 shrink-0 items-center justify-center rounded-control border border-border-strong bg-surface sm:size-10"
                        >
                          <span className="size-4 rounded-full" style={{ backgroundColor: stage.color }} />
                        </button>
                      )}
                    >
                      {STAGE_COLOR_PRESETS.map((option) => (
                        <MenuItem
                          key={option.value}
                          checked={option.value === stage.color}
                          onSelect={() => updateStage(stage.key, { color: option.value })}
                        >
                          <span aria-hidden="true" className="size-4 rounded-full" style={{ backgroundColor: option.value }} />
                          <span className="flex-1">{option.name}</span>
                          {option.value === stage.color && <Check aria-hidden="true" />}
                        </MenuItem>
                      ))}
                    </Menu>
                    <Field label={`Stage ${index + 1} name`} hideLabel className="flex-1">
                      <Input
                        value={stage.name}
                        onChange={(event) => updateStage(stage.key, { name: event.target.value })}
                        placeholder={`Stage ${index + 1}`}
                        maxLength={50}
                        disabled={submitting}
                      />
                    </Field>
                    <IconButton
                      label={`Remove stage ${index + 1}`}
                      onClick={() => setStages((prev) => prev.filter((item) => item.key !== stage.key))}
                      disabled={submitting || stages.length <= 1}
                    >
                      <Trash2 />
                    </IconButton>
                  </li>
                );
              })}
            </ol>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={addStage} disabled={submitting}>
                <Plus aria-hidden="true" />
                Add stage
              </Button>
              <p className="text-xs text-text-muted">Top to bottom becomes left to right on the board.</p>
            </div>
            {showErrors && stagesError && <Alert>{stagesError}</Alert>}
          </div>
        )}

        {createPipeline.isError && (
          <Alert>{getErrorMessage(createPipeline.error, "We couldn't create that pipeline. Try again.")}</Alert>
        )}

        {stageError && orphanPipelineId && (
          <Alert
            title="The pipeline was created, but not all of its stages"
            action={
              <Button size="sm" variant="secondary" onClick={() => onCreated(orphanPipelineId)}>
                Open pipeline
              </Button>
            }
          >
            {stageError}
          </Alert>
        )}
      </form>
    </Dialog>
  );
}
