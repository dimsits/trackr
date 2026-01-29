"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Stage } from "@/hooks/useStages";
import type { Application } from "@/hooks/useApplications";
import Column from "./Column";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";

import { useMoveApplication } from "@/hooks/useMoveApplication";

type Props = {
  stages: Stage[];
  applications: Application[];
  loading: boolean;
  workspaceId: string;
  pipelineId: string;
  onCardClick: (app: Application) => void;
};

function sig(apps: Application[]) {
  return apps.map((a) => `${a.id}:${a.stageId}:${a.position ?? 0}`).join("|");
}

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

  const [activeId, setActiveId] = useState<string | null>(null);
  const lastOverIdRef = useRef<string | null>(null);

  // RAF throttling to avoid dnd-kit useRect measurement update loops
  const rafRef = useRef<number | null>(null);
  const pendingOverRef = useRef<{ appId: string; overId: string } | null>(null);

  const moveM = useMoveApplication(workspaceId, pipelineId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const applicationsSig = useMemo(() => sig(applications), [applications]);
  const appsStateSig = useMemo(() => sig(appsState), [appsState]);

  // Sync local state from server truth (guarded)
  useEffect(() => {
    if (activeId) return; // do not stomp optimistic state while dragging
    if (applicationsSig === appsStateSig) return;

    setAppsState(applications);
    snapshotRef.current = applications;
  }, [applicationsSig, appsStateSig, activeId, applications]);

  const byStage = useMemo(() => {
    const map = new Map<string, Application[]>();
    for (const s of stages) map.set(s.id, []);
    for (const a of appsState) map.get(a.stageId)?.push(a);
    for (const [, v] of map) v.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return map;
  }, [stages, appsState]);

  const activeApp = useMemo(() => {
    if (!activeId) return null;
    return appsState.find((a) => a.id === activeId) ?? null;
  }, [activeId, appsState]);

  const dropAnimation = useMemo(
    () => ({
      duration: 220,
      easing: "cubic-bezier(0.2,0,0,1)",
      sideEffects: defaultDropAnimationSideEffects({
        styles: { active: { opacity: "0.5" } },
      }),
    }),
    []
  );

  function findStageIdOfApp(appId: string, stageMap?: Map<string, Application[]>): string | null {
    const map = stageMap ?? byStage;
    for (const s of stages) {
      const apps = map.get(s.id) ?? [];
      if (apps.some((a) => a.id === appId)) return s.id;
    }
    return null;
  }

  function getStageIdFromOver(overId: string, stageMap?: Map<string, Application[]>): string | null {
    if (stages.some((s) => s.id === overId)) return overId;
    return findStageIdOfApp(overId, stageMap);
  }

  function buildStageLists(list: Application[]) {
    const map = new Map<string, Application[]>();
    for (const s of stages) map.set(s.id, []);
    for (const a of list) map.get(a.stageId)?.push(a);
    for (const [, v] of map) v.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return map;
  }

  function clearRaf() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    pendingOverRef.current = null;
  }

  function applyOptimisticMove(appId: string, overId: string) {
    setAppsState((prev) => {
      const next = prev.map((a) => ({ ...a }));
      const stageLists = buildStageLists(next);

      const fromStageId = findStageIdOfApp(appId, stageLists);
      if (!fromStageId) return prev;

      const toStageId = getStageIdFromOver(overId, stageLists) ?? fromStageId;

      const moving = next.find((a) => a.id === appId);
      if (!moving) return prev;

      const fromList = stageLists.get(fromStageId) ?? [];
      const toList = stageLists.get(toStageId) ?? [];

      // remove
      const fromIndex = fromList.findIndex((a) => a.id === appId);
      if (fromIndex >= 0) fromList.splice(fromIndex, 1);

      // stage update
      moving.stageId = toStageId;

      // insert
      let insertIndex = toList.length;
      if (overId !== toStageId) {
        const overIndex = toList.findIndex((a) => a.id === overId);
        if (overIndex >= 0) insertIndex = overIndex;
      }
      toList.splice(insertIndex, 0, moving);

      // re-position affected stages
      const rePos = (list: Application[]) => list.map((a, i) => ({ ...a, position: i }));
      const updatedFrom = rePos(fromList);
      const updatedTo = fromStageId === toStageId ? updatedFrom : rePos(toList);

      const patchMap = new Map<string, Application>();
      for (const a of updatedFrom) patchMap.set(a.id, a);
      for (const a of updatedTo) patchMap.set(a.id, a);

      return next.map((a) => patchMap.get(a.id) ?? a);
    });
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
    snapshotRef.current = appsState; // rollback snapshot at start
    lastOverIdRef.current = null;
    clearRaf();
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;

    const appId = String(active.id);
    const overId = String(over.id);

    if (lastOverIdRef.current === overId) return;
    lastOverIdRef.current = overId;

    pendingOverRef.current = { appId, overId };

    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const pending = pendingOverRef.current;
      pendingOverRef.current = null;
      if (!pending) return;
      applyOptimisticMove(pending.appId, pending.overId);
    });
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;

    clearRaf();
    setActiveId(null);
    lastOverIdRef.current = null;

    if (!over) {
      setAppsState(snapshotRef.current);
      return;
    }

    const appId = String(active.id);
    const overId = String(over.id);

    // compute final from current optimistic state safely
    const stageLists = buildStageLists(appsState.map((a) => ({ ...a })));
    const toStageId = getStageIdFromOver(overId, stageLists) ?? findStageIdOfApp(appId, stageLists);
    if (!toStageId) return;

    const finalList = stageLists.get(toStageId) ?? [];
    const idx = finalList.findIndex((a) => a.id === appId);
    const nextPosition = idx >= 0 ? idx : 0;

    try {
      await moveM.mutateAsync({ id: appId, stageId: toStageId, position: nextPosition });
    } catch {
      setAppsState(snapshotRef.current);
    }
  }

  function onDragCancel() {
    clearRaf();
    setActiveId(null);
    lastOverIdRef.current = null;
    setAppsState(snapshotRef.current);
  }

  if (loading) return <div className="p-2">Loading board...</div>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="flex gap-3 overflow-x-auto">
        {stages.map((s) => (
          <Column
            key={s.id}
            stage={s}
            apps={byStage.get(s.id) ?? []}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeApp ? (
          <div className="w-[280px]">
            <div className="w-full text-left border p-2 bg-white shadow-lg">
              <div className="font-medium">{activeApp.company}</div>
              <div className="text-sm opacity-70">{activeApp.role}</div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
