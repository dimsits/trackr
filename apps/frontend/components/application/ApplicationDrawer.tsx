"use client";

import type { Application } from "@/hooks/useApplications";
import DrawerShell from "./DrawerShell";
import DrawerSection from "./DrawerSection";
import ActivitiesSection from "./ActivitiesSection";
import TasksSection from "./TasksSection";
import FileSection from "./FileSection";

export default function ApplicationDrawer({
  application,
  open,
  onClose,
}: {
  application: Application | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!application) return null;

  return (
    <DrawerShell open={open} onClose={onClose}>
      <div className="space-y-3">
        {/* Header */}
        <div>
          <div className="text-lg font-semibold">
            {application.company}
          </div>
          <div className="text-sm opacity-70">
            {application.role}
          </div>
        </div>

          <ActivitiesSection applicationId={application.id} />
          <TasksSection applicationId={application.id} />
          <FileSection applicationId={application.id} />

      </div>
    </DrawerShell>
  );
}
