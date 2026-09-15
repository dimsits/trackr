"use client";

import { defaultDropAnimationSideEffects, DndContext, DragOverlay, type DropAnimation } from "@dnd-kit/core";
import { useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import Alert from "@/components/ui/Alert";
import IconButton from "@/components/ui/IconButton";
import type { Application, Stage } from "@/types";
import ApplicationCardContent from "./ApplicationCardContent";
import BoardColumn from "./BoardColumn";
import { resolveStageColor } from "./stageColors";
import { useBoardDnd } from "./useBoardDnd";

type BoardProps = {
  stages: Stage[];
  /** Canonical, unfiltered ordering from the server. */
  applications: Application[];
  workspaceId: string;
  pipelineId: string;
  /** Ids that match the active search/filter, or `null` when unfiltered. Dragging is disabled while filtered. */
  visibleIds: Set<string> | null;
  selectedId: string | null;
  onOpenApplication: (id: string) => void;
};

const dropAnimation: DropAnimation = {
  duration: 200,
  easing: "cubic-bezier(0.2, 0, 0, 1)",
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
};

const screenReaderInstructions = {
  draggable:
    "To pick up an application, press Space or Enter. Use the arrow keys to move it within a stage or to a neighbouring stage. Press Space or Enter again to drop it, or Escape to cancel.",
};

export default function Board({
  stages,
  applications,
  workspaceId,
  pipelineId,
  visibleIds,
  selectedId,
  onOpenApplication,
}: BoardProps) {
  const dnd = useBoardDnd({ stages, applications, workspaceId, pipelineId });
  const reduceMotion = useReducedMotion();
  const filtering = visibleIds !== null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {dnd.moveError && (
        <div className="px-4 pb-3 sm:px-6">
          <Alert
            action={
              <IconButton label="Dismiss message" size="sm" onClick={dnd.dismissMoveError} className="-my-1.5 -mr-1.5">
                <X />
              </IconButton>
            }
          >
            {dnd.moveError}
          </Alert>
        </div>
      )}

      <DndContext
        sensors={dnd.sensors}
        collisionDetection={dnd.collisionDetection}
        accessibility={{ announcements: dnd.announcements, screenReaderInstructions }}
        {...dnd.handlers}
      >
        <div
          role="region"
          aria-label="Pipeline board"
          tabIndex={0}
          // `relative` keeps absolutely positioned descendants (e.g. sr-only
          // labels in off-screen lanes) inside this scroll area.
          className="scrollbar-calm relative min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain focus-visible:outline-offset-[-2px]"
        >
          <div className="flex h-full w-max gap-3 px-4 pb-4 sm:px-6 sm:pb-6">
            {stages.map((stage, index) => {
              const lane = dnd.byStage.get(stage.id) ?? [];
              const visible = visibleIds ? lane.filter((app) => visibleIds.has(app.id)) : lane;
              return (
                <BoardColumn
                  key={stage.id}
                  stage={stage}
                  color={resolveStageColor(stage, index)}
                  applications={visible}
                  totalCount={lane.length}
                  filtering={filtering}
                  dragDisabled={filtering}
                  isDropTarget={dnd.activeStageId === stage.id}
                  selectedId={selectedId}
                  onOpen={onOpenApplication}
                />
              );
            })}
          </div>
        </div>

        <DragOverlay dropAnimation={reduceMotion ? null : dropAnimation}>
          {dnd.activeApplication ? (
            <div className="scale-[1.02] cursor-grabbing rounded-card border border-brand/30 bg-surface shadow-raised">
              <ApplicationCardContent application={dnd.activeApplication} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
