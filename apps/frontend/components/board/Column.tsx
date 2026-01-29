"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Stage } from "@/hooks/useStages";
import type { Application } from "@/hooks/useApplications";
import Card from "./Card";

export default function Column({
  stage,
  apps,
  onCardClick,
}: {
  stage: Stage;
  apps: Application[];
  onCardClick: (app: Application) => void;
}) {
  // Column itself is the droppable target (works even when empty)
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "column", stageId: stage.id },
  });

  const ids = apps.map((a) => a.id);

  return (
    <div className="min-w-[280px] border p-3 rounded-md">
      <div className="font-medium mb-2">{stage.name}</div>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`space-y-2 min-h-[40px] rounded-md p-1 transition ${
            isOver ? "bg-black/5" : ""
          }`}
        >
          {apps.map((a) => (
            <Card key={a.id} app={a} stageId={stage.id} onClick={() => onCardClick(a)} />
          ))}

          {apps.length === 0 && <div className="text-sm opacity-50 p-2">Empty</div>}
        </div>
      </SortableContext>
    </div>
  );
}
