"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Inbox, SearchX } from "lucide-react";
import { useId, useMemo } from "react";
import { cn } from "@/lib/cn";
import type { Application, Stage } from "@/types";
import ApplicationCard from "./ApplicationCard";

type Props = {
  stage: Stage;
  color: string;
  /** Cards to render, already filtered. */
  applications: Application[];
  totalCount: number;
  filtering: boolean;
  dragDisabled: boolean;
  isDropTarget: boolean;
  selectedId: string | null;
  onOpen: (id: string) => void;
};

export default function BoardColumn({
  stage,
  color,
  applications,
  totalCount,
  filtering,
  dragDisabled,
  isDropTarget,
  selectedId,
  onOpen,
}: Props) {
  const { setNodeRef } = useDroppable({ id: stage.id, disabled: dragDisabled });
  const headingId = useId();
  const ids = useMemo(() => applications.map((app) => app.id), [applications]);
  const count = applications.length;

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={headingId}
      data-drop-target={isDropTarget || undefined}
      className={cn(
        "flex h-full w-[304px] shrink-0 flex-col rounded-card border transition-[background-color,border-color] duration-150 ease-calm sm:w-[316px]",
        isDropTarget ? "border-brand/40 bg-brand-soft" : "border-transparent bg-surface-muted"
      )}
    >
      <header className="flex items-center gap-2 px-3.5 pb-2.5 pt-3">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-full ring-[3px] ring-surface"
          style={{ backgroundColor: color }}
        />
        <h2 id={headingId} className="min-w-0 flex-1 truncate text-sm font-bold text-text" title={stage.name}>
          {stage.name}
        </h2>
        <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs font-semibold tabular-nums text-text-muted">
          <span aria-hidden="true">
            {count}
            {filtering && <span className="text-text-subtle"> / {totalCount}</span>}
          </span>
          <span className="sr-only">
            {filtering
              ? `${count} of ${totalCount} applications shown`
              : `${count} ${count === 1 ? "application" : "applications"}`}
          </span>
        </span>
      </header>

      <div className="scrollbar-calm relative min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {count > 0 ? (
            <ul className="flex flex-col gap-2 pb-1 pt-0.5">
              {applications.map((app) => (
                <li key={app.id}>
                  <ApplicationCard
                    application={app}
                    dragDisabled={dragDisabled}
                    selected={app.id === selectedId}
                    onOpen={onOpen}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div
              className={cn(
                "flex min-h-32 flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed px-4 py-6 text-center",
                "transition-colors duration-150",
                isDropTarget ? "border-brand/60 bg-surface/70" : "border-border-strong"
              )}
            >
              {filtering ? (
                <>
                  <SearchX aria-hidden="true" className="size-5 text-text-subtle" />
                  <p className="text-[13px] font-semibold text-text-muted">No matches in this stage</p>
                </>
              ) : (
                <>
                  <Inbox aria-hidden="true" className="size-5 text-text-subtle" />
                  <p className="text-[13px] font-semibold text-text-muted">No applications yet</p>
                  <p className="text-xs text-text-muted">Drag a card here to move it into {stage.name}.</p>
                </>
              )}
            </div>
          )}
        </SortableContext>
      </div>
    </section>
  );
}
