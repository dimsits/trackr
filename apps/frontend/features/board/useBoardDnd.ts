"use client";

import {
  closestCenter,
  closestCorners,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMoveApplication } from "@/hooks/useMoveApplication";
import { getErrorMessage } from "@/lib/errors";
import type { Application, Stage } from "@/types";
import { groupByStage, moveApplication, toServerPosition } from "./ordering";

type Options = {
  stages: Stage[];
  /** Canonical, unfiltered server ordering. */
  applications: Application[];
  workspaceId: string;
  pipelineId: string;
};

type PendingOver = { activeId: string; overId: string; placeBelow: boolean };

/** Whether the dragged card's centre is below the middle of the card it is over. */
function isBelow(active: DragOverEvent["active"], over: NonNullable<DragOverEvent["over"]>) {
  const translated = active.rect.current.translated;
  if (!translated) return false;
  return translated.top + translated.height / 2 > over.rect.top + over.rect.height / 2;
}

/**
 * Drag controller for the board.
 *
 * Ordering shown to the user is `optimistic ?? applications`. The optimistic
 * list exists only while dragging and while moves are in flight. Every move
 * mutation refetches the applications query before it settles, so clearing
 * the optimistic list afterwards reveals server truth: the confirmed order on
 * success, or the original order (a rollback) on failure.
 */
export function useBoardDnd({ stages, applications, workspaceId, pipelineId }: Options) {
  const moveM = useMoveApplication(workspaceId, pipelineId);

  const [optimistic, setOptimistic] = useState<Application[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const items = optimistic ?? applications;
  const byStage = useMemo(() => groupByStage(stages, items), [stages, items]);

  // Latest values for event handlers, which dnd-kit calls outside render.
  const latest = useRef({ items, byStage, stages, applications });
  useLayoutEffect(() => {
    latest.current = { items, byStage, stages, applications };
  }, [items, byStage, stages, applications]);

  const snapshotRef = useRef<Application[] | null>(null);
  const pendingMovesRef = useRef(0);
  const draggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const pendingOverRef = useRef<PendingOver | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Press-and-hold on touch so swiping still scrolls the board.
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function stageOf(list: Application[], id: string): string | null {
    if (latest.current.stages.some((stage) => stage.id === id)) return id;
    return list.find((app) => app.id === id)?.stageId ?? null;
  }

  function cancelFrame() {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    pendingOverRef.current = null;
  }

  function settle() {
    if (pendingMovesRef.current === 0 && !draggingRef.current) setOptimistic(null);
  }

  function restoreSnapshot() {
    if (pendingMovesRef.current === 0) setOptimistic(null);
    else setOptimistic(snapshotRef.current);
  }

  /** Index a card from another lane should take when dropped over `overId`. */
  function insertionIndex(list: Application[], stageId: string, overId: string, placeBelow: boolean) {
    const lane = groupByStage(latest.current.stages, list).get(stageId) ?? [];
    if (overId === stageId) return lane.length;
    const overIndex = lane.findIndex((app) => app.id === overId);
    return overIndex < 0 ? lane.length : overIndex + (placeBelow ? 1 : 0);
  }

  const collisionDetection: CollisionDetection = (args) => {
    // Pointer drags: the lane under the pointer wins, then its closest card.
    const pointerHits = pointerWithin(args);
    const hits = pointerHits.length > 0 ? pointerHits : rectIntersection(args);
    const firstId = getFirstCollision(hits, "id");

    if (firstId == null) return closestCorners(args);

    const laneIds = latest.current.byStage.get(String(firstId));
    if (laneIds && laneIds.length > 0) {
      const cardIds = new Set<UniqueIdentifier>(laneIds.map((app) => app.id));
      const closest = closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter((container) => cardIds.has(container.id)),
      });
      if (closest.length > 0) return [closest[0]];
    }
    return [{ id: firstId }];
  };

  function onDragStart({ active }: DragStartEvent) {
    cancelFrame();
    draggingRef.current = true;
    snapshotRef.current = latest.current.items;
    setOptimistic(latest.current.items);
    setActiveId(String(active.id));
    setMoveError(null);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const dragged = String(active.id);
    const overId = String(over.id);
    const list = latest.current.items;
    const from = stageOf(list, dragged);
    const to = stageOf(list, overId);
    // Reordering inside a lane is previewed by sortable transforms and
    // committed on drop. Only cross-lane moves change the list mid-drag.
    if (!from || !to || from === to) return;

    pendingOverRef.current = { activeId: dragged, overId, placeBelow: isBelow(active, over) };

    // Throttle to one update per frame to avoid measurement feedback loops.
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const pending = pendingOverRef.current;
      pendingOverRef.current = null;
      if (!pending) return;
      setOptimistic((prev) => {
        const current = prev ?? latest.current.applications;
        const fromStage = stageOf(current, pending.activeId);
        const toStage = stageOf(current, pending.overId);
        if (!fromStage || !toStage || fromStage === toStage) return prev;
        const index = insertionIndex(current, toStage, pending.overId, pending.placeBelow);
        return moveApplication(current, latest.current.stages, pending.activeId, toStage, index);
      });
    });
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    cancelFrame();
    draggingRef.current = false;
    setActiveId(null);

    const dragged = String(active.id);
    const snapshot = snapshotRef.current ?? latest.current.applications;
    if (!over) {
      restoreSnapshot();
      return;
    }

    const { stages: currentStages, applications: server } = latest.current;
    const overId = String(over.id);
    let list = latest.current.items;
    const from = stageOf(list, dragged);
    const to = stageOf(list, overId);
    if (!from || !to) {
      restoreSnapshot();
      return;
    }

    if (from !== to) {
      // A cross-lane move was still waiting for its animation frame.
      const index = insertionIndex(list, to, overId, isBelow(active, over));
      list = moveApplication(list, currentStages, dragged, to, index);
    } else if (overId !== dragged && overId !== to) {
      const lane = groupByStage(currentStages, list).get(to) ?? [];
      const newIndex = lane.findIndex((app) => app.id === overId);
      if (newIndex >= 0) list = moveApplication(list, currentStages, dragged, to, newIndex);
    }

    const finalLane = groupByStage(currentStages, list).get(to) ?? [];
    const original = snapshot.find((app) => app.id === dragged);
    const originalLane = original ? (groupByStage(currentStages, snapshot).get(original.stageId) ?? []) : [];
    const unchanged =
      original?.stageId === to &&
      originalLane.findIndex((app) => app.id === dragged) === finalLane.findIndex((app) => app.id === dragged);

    if (unchanged) {
      restoreSnapshot();
      return;
    }

    setOptimistic(list);
    pendingMovesRef.current += 1;
    const moved = list.find((app) => app.id === dragged);

    try {
      await moveM.mutateAsync({
        id: dragged,
        stageId: to,
        position: toServerPosition(server, finalLane, dragged),
      });
    } catch (error) {
      const name = moved ? `${moved.role} at ${moved.company}` : "that application";
      setMoveError(`Couldn't move ${name}, so it's back where it was. ${getErrorMessage(error, "")}`.trim());
    } finally {
      pendingMovesRef.current -= 1;
      settle();
    }
  }

  function onDragCancel() {
    cancelFrame();
    draggingRef.current = false;
    setActiveId(null);
    restoreSnapshot();
  }

  function describe(id: UniqueIdentifier | undefined) {
    const app = latest.current.items.find((item) => item.id === String(id));
    return app ? `${app.role} at ${app.company}` : "Application";
  }

  function describeTarget(overId: UniqueIdentifier) {
    const { items: list, stages: currentStages, byStage: lanes } = latest.current;
    const stageId = stageOf(list, String(overId));
    const stage = currentStages.find((s) => s.id === stageId);
    if (!stage) return "an unknown stage";
    const lane = lanes.get(stage.id) ?? [];
    const index = lane.findIndex((app) => app.id === String(overId));
    return index >= 0
      ? `position ${index + 1} of ${lane.length} in ${stage.name}`
      : `${stage.name}, ${lane.length} ${lane.length === 1 ? "application" : "applications"}`;
  }

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${describe(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${describe(active.id)} is over ${describeTarget(over.id)}.` : `${describe(active.id)} is not over a stage.`,
    onDragEnd: ({ active, over }) =>
      over ? `Dropped ${describe(active.id)} at ${describeTarget(over.id)}.` : `Dropped ${describe(active.id)}.`,
    onDragCancel: ({ active }) => `Cancelled moving ${describe(active.id)}. It is back where it started.`,
  };

  const activeApplication = activeId ? items.find((app) => app.id === activeId) ?? null : null;
  const activeStageId = activeApplication?.stageId ?? null;

  return {
    sensors,
    collisionDetection,
    announcements,
    byStage,
    activeApplication,
    activeStageId,
    moveError,
    dismissMoveError: () => setMoveError(null),
    handlers: { onDragStart, onDragOver, onDragEnd, onDragCancel },
  };
}
