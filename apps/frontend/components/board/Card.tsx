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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: app.id,
      data: { type: "card", appId: app.id, fromStageId: stageId } satisfies DragCardData,
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      type="button"
      className="w-full text-left border p-2"
      onClick={onClick}
    >
      <div className="font-medium">{app.company}</div>
      <div className="text-sm opacity-70">{app.role}</div>
    </button>
  );
}
