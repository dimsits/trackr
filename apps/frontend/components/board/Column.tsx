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
  // droppable column target (works even when empty)
  const { setNodeRef } = useDroppable({
    id: stage.id,
    data: { type: "column", stageId: stage.id },
  });

  return (
    <div className="min-w-[280px] border p-3">
      <div className="font-medium mb-2">{stage.name}</div>
      <SortableContext items={apps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="space-y-2 min-h-[40px]">
          {apps.map((a) => (
            <Card key={a.id} app={a} stageId={stage.id} onClick={() => onCardClick(a)} />
          ))}
          {apps.length === 0 && <div className="text-sm opacity-50">Empty</div>}
        </div>
      </SortableContext>
    </div>
  );
}
