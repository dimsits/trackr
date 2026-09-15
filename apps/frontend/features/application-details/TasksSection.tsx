"use client";

import { ListChecks, Plus } from "lucide-react";
import { useState } from "react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Field";
import { useCreateTask } from "@/hooks/useCreateTask";
import { useTasks } from "@/hooks/useTasks";
import { useUpdateTask } from "@/hooks/useUpdateTask";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import type { Task } from "@/types";
import { SectionError, SectionLoading } from "./SectionStates";

export default function TasksSection({ applicationId }: { applicationId: string }) {
  const tasksQ = useTasks(applicationId);
  const createM = useCreateTask(applicationId);
  const updateM = useUpdateTask(applicationId);
  const [title, setTitle] = useState("");
  const trimmed = title.trim();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!trimmed || createM.isPending) return;
    try {
      await createM.mutateAsync(trimmed);
      setTitle("");
    } catch {
      // Surfaced through createM.error below.
    }
  }

  const tasks = tasksQ.data ?? [];
  const open = tasks.filter((task) => task.status === "OPEN");
  const closed = tasks.filter((task) => task.status !== "OPEN");

  function renderTask(task: Task) {
    const saving = updateM.isPending && updateM.variables?.id === task.id;
    // While saving, reflect the requested state so the checkbox responds immediately.
    const status = saving && updateM.variables ? updateM.variables.status : task.status;
    const done = status === "DONE";
    const canceled = status === "CANCELED";
    return (
      <li key={task.id} className="px-3 py-3">
        <Checkbox
          checked={done}
          disabled={saving}
          onChange={() => updateM.mutate({ id: task.id, status: task.status === "DONE" ? "OPEN" : "DONE" })}
          labelClassName={cn(
            "[overflow-wrap:anywhere]",
            done || canceled ? "text-text-muted line-through decoration-text-subtle" : "text-text"
          )}
          label={task.title}
          description={
            saving || task.dueAt || canceled ? (
              <span className="flex flex-wrap items-center gap-2">
                {saving && <span>Saving…</span>}
                {task.dueAt && <span>Due {formatDate(task.dueAt)}</span>}
                {canceled && <Badge tone="outline">Canceled</Badge>}
              </span>
            ) : undefined
          }
        />
      </li>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-2">
        <div className="flex items-end gap-2">
          <Field label="Add a task" className="flex-1">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Send a thank-you note"
              maxLength={120}
              autoComplete="off"
            />
          </Field>
          <Button type="submit" variant="secondary" loading={createM.isPending} disabled={!trimmed}>
            {!createM.isPending && <Plus aria-hidden="true" />}
            Add
          </Button>
        </div>
        {createM.isError && <Alert>{getErrorMessage(createM.error, "We couldn't add that task. Try again.")}</Alert>}
      </form>

      {updateM.isError && <Alert>{getErrorMessage(updateM.error, "We couldn't update that task. Try again.")}</Alert>}

      {tasksQ.isLoading ? (
        <SectionLoading label="Loading tasks" rows={2} />
      ) : tasksQ.isError ? (
        <SectionError
          message="We couldn't load the tasks for this application."
          onRetry={() => tasksQ.refetch()}
          retrying={tasksQ.isFetching}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          variant="inline"
          headingLevel="h3"
          icon={<ListChecks />}
          title="No tasks yet"
          description="Add follow-ups, like preparing for an interview or chasing a reply."
        />
      ) : (
        <div className="space-y-5">
          {open.length > 0 && (
            <section aria-labelledby={`${applicationId}-tasks-open`}>
              <h3 id={`${applicationId}-tasks-open`} className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-text-muted">
                To do · {open.length}
              </h3>
              <ul className="divide-y divide-border rounded-card border border-border bg-surface">{open.map(renderTask)}</ul>
            </section>
          )}
          {closed.length > 0 && (
            <section aria-labelledby={`${applicationId}-tasks-done`}>
              <h3 id={`${applicationId}-tasks-done`} className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-text-muted">
                Done · {closed.length}
              </h3>
              <ul className="divide-y divide-border rounded-card border border-border bg-surface-muted/50">
                {closed.map(renderTask)}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
