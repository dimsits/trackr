"use client";

import { useState } from "react";
import DrawerSection from "./DrawerSection";
import { useTasks } from "@/hooks/useTasks";
import { useCreateTask } from "@/hooks/useCreateTask";
import { useUpdateTask } from "@/hooks/useUpdateTask";

export default function TasksSection({
  applicationId,
}: {
  applicationId: string;
}) {
  const { data, isLoading, isError } = useTasks(applicationId);
  const createM = useCreateTask(applicationId);
  const updateM = useUpdateTask(applicationId);

  const [title, setTitle] = useState("");

  async function submit() {
    if (!title.trim()) return;
    await createM.mutateAsync(title.trim());
    setTitle("");
  }

  return (
    <DrawerSection title="Tasks">
      {isLoading && <div className="text-sm">Loading…</div>}
      {isError && (
        <div className="text-sm text-red-600">
          Failed to load tasks
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-2">
          {data?.length === 0 && (
            <div className="text-sm opacity-60">No tasks yet</div>
          )}

          {data?.map((t) => (
            <label key={t.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={t.status === "DONE"}
                disabled={updateM.isPending}
                onChange={() =>
                  updateM.mutateAsync({
                    id: t.id,
                    status: t.status === "DONE" ? "OPEN" : "DONE",
                  })
                }
              />
              <span className={t.status === "DONE" ? "line-through opacity-60" : ""}>
                {t.title}
              </span>
              {t.dueAt && (
                <span className="text-xs opacity-50">
                  ({new Date(t.dueAt).toLocaleDateString()})
                </span>
              )}
            </label>
          ))}
        </div>
      )}

      {/* add task */}
      <div className="mt-3 flex gap-2">
        <input
          className="border p-2 text-sm flex-1"
          placeholder="New task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className="border px-3 text-sm"
          disabled={createM.isPending}
          onClick={submit}
        >
          {createM.isPending ? "Adding…" : "Add"}
        </button>
      </div>

      {(createM.error as any)?.message && (
        <div className="text-sm text-red-600">
          {(createM.error as any).message}
        </div>
      )}
    </DrawerSection>
  );
}
