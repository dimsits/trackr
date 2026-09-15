"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpRight, GripVertical } from "lucide-react";
import { memo, useId } from "react";
import { cn } from "@/lib/cn";
import { toSafeHref } from "@/lib/format";
import type { Application } from "@/types";
import ApplicationCardContent from "./ApplicationCardContent";

type Props = {
  application: Application;
  dragDisabled: boolean;
  selected: boolean;
  onOpen: (id: string) => void;
};

/**
 * A sortable card. Pointer drags start anywhere on the card (after a short
 * distance, or press-and-hold on touch), so a plain click still opens the
 * details. Keyboard dragging lives on the dedicated handle so Enter on the
 * card keeps opening the application.
 */
function ApplicationCard({ application, dragDisabled, selected, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: application.id,
    disabled: dragDisabled,
  });
  const metaId = useId();

  const { onKeyDown, ...pointerListeners } = listeners ?? {};
  const href = toSafeHref(application.link);
  const name = `${application.role} at ${application.company}`;
  const actionCount = (href ? 1 : 0) + (dragDisabled ? 0 : 1);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...pointerListeners}
      className={cn(
        "group relative select-none rounded-card border bg-surface [-webkit-touch-callout:none]",
        "transition-[border-color,box-shadow,background-color] duration-150 ease-calm",
        isDragging
          ? "border-dashed border-brand/45 bg-brand-soft/60 shadow-none [&>*]:invisible"
          : selected
            ? "border-brand shadow-card-hover ring-1 ring-brand"
            : "border-border shadow-card hover:border-border-strong hover:shadow-card-hover",
        !dragDisabled && "cursor-grab active:cursor-grabbing"
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(application.id)}
        aria-label={name}
        aria-describedby={metaId}
        aria-haspopup="dialog"
        aria-current={selected || undefined}
        className="absolute inset-0 rounded-card"
      />

      <div className="pointer-events-none relative">
        <ApplicationCardContent
          application={application}
          metaId={metaId}
          actionsWidth={actionCount === 2 ? "two" : actionCount === 1 ? "one" : "none"}
          actions={
            actionCount > 0 ? (
              <>
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open job posting for ${name} (opens in a new tab)`}
                    title="Open job posting"
                    className="pointer-events-auto flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-text"
                  >
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                )}
                {!dragDisabled && (
                  <button
                    type="button"
                    ref={setActivatorNodeRef}
                    {...attributes}
                    onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLButtonElement> | undefined}
                    aria-label={`Move ${name}`}
                    title="Drag to move"
                    className={cn(
                      "pointer-events-auto flex size-8 cursor-grab items-center justify-center rounded-lg text-text-subtle",
                      "transition-[opacity,background-color,color] duration-150 hover:bg-surface-muted hover:text-text",
                      "focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:hover)]:opacity-0"
                    )}
                  >
                    <GripVertical aria-hidden="true" className="size-4" />
                  </button>
                )}
              </>
            ) : null
          }
        />
      </div>
    </div>
  );
}

export default memo(ApplicationCard);
