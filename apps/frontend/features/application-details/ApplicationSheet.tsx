"use client";

import { FileText, ListChecks, MessageSquareText, Pencil, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Monogram from "@/components/ui/Monogram";
import Sheet from "@/components/ui/Sheet";
import { TabPanel, Tabs } from "@/components/ui/Tabs";
import PriorityBadge, { STATUS_LABELS } from "@/features/board/PriorityBadge";
import { resolveStageColor } from "@/features/board/stageColors";
import type { Application, Stage } from "@/types";
import ActivitiesSection from "./ActivitiesSection";
import ApplicationSummary from "./ApplicationSummary";
import EditApplicationForm from "./EditApplicationForm";
import FilesSection from "./FilesSection";
import SectionBoundary from "./SectionBoundary";
import TasksSection from "./TasksSection";

type SectionTab = "activity" | "tasks" | "files";

const TABS = [
  { value: "activity" as const, label: "Activity", icon: <MessageSquareText aria-hidden="true" /> },
  { value: "tasks" as const, label: "Tasks", icon: <ListChecks aria-hidden="true" /> },
  { value: "files" as const, label: "Files", icon: <FileText aria-hidden="true" /> },
];

type Props = {
  open: boolean;
  application: Application | null;
  stages: Stage[];
  onClose: () => void;
};

export default function ApplicationSheet({ open, application, stages, onClose }: Props) {
  const titleId = useId();

  return (
    <Sheet open={open} onClose={onClose} labelledBy={titleId}>
      {application && (
        // Keyed so switching applications resets edit mode and the active tab.
        <SheetBody key={application.id} application={application} stages={stages} titleId={titleId} onClose={onClose} />
      )}
    </Sheet>
  );
}

function SheetBody({
  application,
  stages,
  titleId,
  onClose,
}: {
  application: Application;
  stages: Stage[];
  titleId: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [tab, setTab] = useState<SectionTab>("activity");
  const tabsId = useId();
  const editButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousMode = useRef(mode);

  // The Edit button unmounts while editing; give focus back when returning.
  useEffect(() => {
    if (previousMode.current === "edit" && mode === "view") editButtonRef.current?.focus();
    previousMode.current = mode;
  }, [mode]);

  const stageIndex = stages.findIndex((stage) => stage.id === application.stageId);
  const stage = stageIndex >= 0 ? stages[stageIndex] : undefined;

  return (
    <>
      <header className="shrink-0 border-b border-border bg-surface px-5 pb-4 pt-4 sm:px-6 sm:pt-5">
        <div className="flex items-start gap-3">
          <Monogram name={application.company} size="lg" className="mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-text-muted">{application.company}</p>
            <h2
              id={titleId}
              className="line-clamp-3 text-lg font-extrabold leading-6 tracking-tight text-text [overflow-wrap:anywhere] sm:text-xl sm:leading-7"
            >
              {application.role}
            </h2>
          </div>
          <div className="-mr-2 flex shrink-0 items-center gap-1">
            {mode === "view" && (
              <Button ref={editButtonRef} variant="secondary" size="sm" onClick={() => setMode("edit")}>
                <Pencil aria-hidden="true" />
                Edit
              </Button>
            )}
            <IconButton label="Close application details" onClick={onClose}>
              <X />
            </IconButton>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-14">
          {stage && (
            <Badge
              tone="outline"
              icon={
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full"
                  style={{ backgroundColor: resolveStageColor(stage, stageIndex) }}
                />
              }
            >
              <span className="sr-only">Stage: </span>
              {stage.name}
            </Badge>
          )}
          <PriorityBadge priority={application.priority} />
          {application.status !== "ACTIVE" && <Badge tone="outline">{STATUS_LABELS[application.status]}</Badge>}
        </div>
      </header>

      {mode === "edit" ? (
        <EditApplicationForm
          application={application}
          onCancel={() => setMode("view")}
          onSaved={() => setMode("view")}
          onDeleted={onClose}
        />
      ) : (
        <div className="scrollbar-calm relative min-h-0 flex-1 overflow-y-auto">
          <ApplicationSummary application={application} />

          <div className="px-5 pb-10 sm:px-6">
            <Tabs idBase={tabsId} label="Application sections" items={TABS} value={tab} onChange={setTab} />
            <TabPanel idBase={tabsId} value={tab} className="pt-5">
              {tab === "activity" && (
                <SectionBoundary title="Activity">
                  <ActivitiesSection applicationId={application.id} stages={stages} />
                </SectionBoundary>
              )}
              {tab === "tasks" && (
                <SectionBoundary title="Tasks">
                  <TasksSection applicationId={application.id} />
                </SectionBoundary>
              )}
              {tab === "files" && (
                <SectionBoundary title="Files">
                  <FilesSection applicationId={application.id} />
                </SectionBoundary>
              )}
            </TabPanel>
          </div>
        </div>
      )}
    </>
  );
}
