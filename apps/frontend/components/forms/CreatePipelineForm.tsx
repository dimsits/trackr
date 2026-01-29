"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useCreatePipeline } from "@/hooks/useCreatePipeline";

type StageDraft = { name: string; color?: string };

export default function CreatePipelineForm({
  workspaceId,
  onCancel,
  onCreated,
}: {
  workspaceId: string;
  onCancel: () => void;
  onCreated?: (pipelineId: string) => void;
}) {
  const createPipeline = useCreatePipeline();

  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Option A: allow custom stages at creation time
  const [useCustomStages, setUseCustomStages] = useState(false);
  const [stages, setStages] = useState<StageDraft[]>([
    { name: "Interested" },
    { name: "Applied" },
    { name: "Interview" },
    { name: "Offer" },
    { name: "Rejected" },
  ]);

  const [localError, setLocalError] = useState<string | null>(null);

  const submitting = createPipeline.isPending;

  const errorMsg = useMemo(() => {
    const hookMsg =
      (createPipeline.error as any)?.message ??
      (createPipeline.isError ? "Failed to create pipeline" : null);
    return localError ?? hookMsg;
  }, [createPipeline.error, createPipeline.isError, localError]);

  function updateStage(i: number, patch: Partial<StageDraft>) {
    setStages((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    );
  }

  function addStage() {
    setStages((prev) => [...prev, { name: "" }]);
  }

  function removeStage(i: number) {
    setStages((prev) => prev.filter((_, idx) => idx !== i));
  }

  function hasAtLeastOneValidStage() {
    return stages.some((s) => s.name.trim().length > 0);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    setLocalError(null);

    if (useCustomStages && !hasAtLeastOneValidStage()) {
      setLocalError("Add at least one stage.");
      return;
    }

    // 1) Create pipeline
    const pipeline = await createPipeline.mutateAsync({
      workspaceId,
      name: trimmed,
      isDefault,
      // IMPORTANT:
      // if custom stages, do NOT create default stages
      createDefaultStages: !useCustomStages,
    });

    // 2) Create stages (in order) if custom
    if (useCustomStages) {
      try {
        for (const s of stages) {
          const stageName = s.name.trim();
          if (!stageName) continue;

          await api(`/pipelines/${pipeline.id}/stages`, {
            method: "POST",
            body: JSON.stringify({
              name: stageName,
              color: s.color?.trim() || undefined,
            }),
          });
        }
      } catch (err: any) {
        setLocalError(
          err?.message ?? "Pipeline created, but failed to create stages."
        );
        return;
      }
    }

    createPipeline.reset();
    onCreated?.(pipeline.id);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-1">
        <div className="text-sm">Pipeline name</div>
        <input
          className="w-full rounded border px-3 py-2 bg-transparent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Internship 2026"
          autoFocus
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          disabled={submitting}
        />
        <span className="text-sm">Set as default pipeline</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={useCustomStages}
          onChange={(e) => setUseCustomStages(e.target.checked)}
          disabled={submitting}
        />
        <span className="text-sm">Define stages now</span>
      </label>

      {useCustomStages && (
        <div className="space-y-2 rounded border p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Stages</div>
            <button
              type="button"
              className="text-sm underline"
              onClick={addStage}
              disabled={submitting}
            >
              Add stage
            </button>
          </div>

          <div className="space-y-2">
            {stages.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  className="flex-1 rounded border px-3 py-2 bg-transparent"
                  placeholder={`Stage ${i + 1} name`}
                  value={s.name}
                  onChange={(e) => updateStage(i, { name: e.target.value })}
                  disabled={submitting}
                />

                <input
                  className="w-28 rounded border px-2 py-2 bg-transparent"
                  placeholder="#4F46E5"
                  value={s.color ?? ""}
                  onChange={(e) => updateStage(i, { color: e.target.value })}
                  disabled={submitting}
                />

                <button
                  type="button"
                  className="rounded border px-2 py-2 hover:bg-black/5"
                  onClick={() => removeStage(i)}
                  disabled={submitting || stages.length <= 1}
                  aria-label="Remove stage"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="text-xs opacity-70">
            Order here becomes the stage order. Leave color blank if unused.
          </div>
        </div>
      )}

      {errorMsg && <div className="text-sm text-red-500">{errorMsg}</div>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded border px-3 py-2 hover:bg-black/5"
          onClick={() => {
            if (!submitting) {
              createPipeline.reset();
              setLocalError(null);
              onCancel();
            }
          }}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded bg-black text-white px-3 py-2 disabled:opacity-50"
          disabled={submitting || !name.trim()}
        >
          {submitting ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
