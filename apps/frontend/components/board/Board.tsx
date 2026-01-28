"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Stage } from "@/hooks/useStages";
import type { Application } from "@/hooks/useApplications";
import Column from "./Column";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  closestCorners,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { useMoveApplication } from "@/hooks/useMoveApplication";
import type { DragCardData } from "./types";

type Props = {
  stages: Stage[];
  applications: Application[];
  loading: boolean;
  workspaceId: string;
  pipelineId: string;
  onCardClick: (app: Application) => void; // keep your Phase 2 edit panel
};

export default function Board({
  stages,
  applications,
  loading,
  workspaceId,
  pipelineId,
  onCardClick,
}: Props) {
  const [appsState, setAppsState] = useState<Application[]>(applications);
  const snapshotRef = useRef<Application[]>(applications);

  // Keep local state in sync when server truth changes
  useEffect(() => {
    setAppsState(applications);
    snapshotRef.current = applications;
  }, [applications]);

  const moveM = useMoveApplication(workspaceId, pipelineId);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byStage = useMemo(() => {
    const map = new Map<string, Application[]>();
    for (const s of stages) map.set(s.id, []);
    for (const a of appsState) map.get(a.stageId)?.push(a);
    for (const [k, v] of map) v.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return map;
  }, [stages, appsState]);

  function findStageIdOfApp(appId: string): string | null {
    for (const s of stages) {
      const apps = byStage.get(s.id) ?? [];
      if (apps.some((a) => a.id === appId)) return s.id;
    }
    return null;
  }

  function getAppIndexInStage(stageId: string, appId: string): number {
    const list = byStage.get(stageId) ?? [];
    return list.findIndex((a) => a.id === appId);
  }

  


  async function onDragEnd(e: DragEndEvent) {
  const { active, over } = e;
  console.log("dragEnd", { active: active.id, over: over?.id });
  if (!over) return;

  const appId = String(active.id);
  const overId = String(over.id);

  const fromStageId = findStageIdOfApp(appId);
  if (!fromStageId) return;

  const toStageId = getStageIdFromOver(overId) ?? fromStageId;

  // snapshot for rollback
  snapshotRef.current = appsState;

  // OPTIMISTIC UPDATE
  let nextStageId = toStageId;
  let nextPosition = 0;

  setAppsState((prev) => {
    const next = prev.map((a) => ({ ...a })); // clone

    const moving = next.find((a) => a.id === appId);
    if (!moving) return prev;

    const stageLists = buildStageLists(next);

    const fromList = stageLists.get(fromStageId) ?? [];
    const toList = stageLists.get(toStageId) ?? [];

    // remove moving from its current list
    const fromIndex = fromList.findIndex((a) => a.id === appId);
    if (fromIndex >= 0) fromList.splice(fromIndex, 1);

    // update stage
    moving.stageId = toStageId;

    // compute insert index
    let insertIndex = toList.length;

    // if dropping over a CARD, insert at that card's index
    if (!overId.startsWith("column:")) {
      const overIndex = toList.findIndex((a) => a.id === overId);
      if (overIndex >= 0) insertIndex = overIndex;
    }
    // if dropping over a COLUMN, append to end (insertIndex already = length)

    toList.splice(insertIndex, 0, moving);

    // reassign sequential positions for both affected stages
    const rePos = (list: Application[]) => list.map((a, i) => ({ ...a, position: i }));

    const updatedFrom = rePos(fromList);
    const updatedTo = fromStageId === toStageId ? updatedFrom : rePos(toList);

    // capture final position of moving
    const movedList = fromStageId === toStageId ? updatedFrom : updatedTo;
    const idx = movedList.findIndex((a) => a.id === appId);
    nextPosition = idx >= 0 ? idx : 0;
    nextStageId = toStageId;

    // write back into next array
    const patchMap = new Map<string, Application>();
    for (const a of updatedFrom) patchMap.set(a.id, a);
    for (const a of updatedTo) patchMap.set(a.id, a);

    return next.map((a) => patchMap.get(a.id) ?? a);
  });

  // PERSIST (server truth)
  try {
    await moveM.mutateAsync({ id: appId, stageId: nextStageId, position: nextPosition });
  } catch {
    setAppsState(snapshotRef.current);
  }
}


    function getStageIdFromOver(overId: string): string | null {
      if (stages.some((s) => s.id === overId)) return overId;;
      return findStageIdOfApp(overId); // if over a card id
    }

  function buildStageLists(list: Application[]) {
    const map = new Map<string, Application[]>();
    for (const s of stages) map.set(s.id, []);
    for (const a of list) map.get(a.stageId)?.push(a);
    for (const [, v] of map) v.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return map;
  }

  if (loading) return <div className="p-2">Loading board...</div>;


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto">
        {stages.map((s) => (
          <Column
            key={s.id}
            stage={s}
            apps={(byStage.get(s.id) ?? [])}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  );
}
