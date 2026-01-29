"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Application } from "@/hooks/useApplications";
import type { DragCardData } from "./types";

export default function Card({
  app,
  stageId,
  onClick,
}: {
  app: Application;
  stageId: string;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: app.id,
    data: { type: "card", appId: app.id, fromStageId: stageId } satisfies DragCardData,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Hide the original card while dragging; DragOverlay is the visible one.
    opacity: isDragging ? 0 : 1,
    // Prevent accidental clicks while the overlay is active.
    pointerEvents: isDragging ? "none" : "auto",
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      type="button"
      className="w-full text-left border p-2 rounded-md bg-white transition-shadow hover:shadow-sm"
      onClick={onClick}
    >
      <div className="font-medium">{app.company}</div>
      <div className="text-sm opacity-70">{app.role}</div>
    </button>
  );
}
