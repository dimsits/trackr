"use client";

import { useEffect, useState } from "react";
import type { Application } from "@/hooks/useApplications";

import DrawerShell from "./DrawerShell";
import SectionBoundary from "./SectionBoundary";
import ActivitiesSection from "./ActivitiesSection";
import TasksSection from "./TasksSection";
import FileSection from "./FileSection";
import EditApplicationForm from "./EditApplication";

export default function ApplicationDrawer({
  application,
  open,
  onClose,
}: {
  application: Application | null;
  open: boolean;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  // If drawer closes or a different application opens, exit edit mode.
  useEffect(() => {
    if (!open) setIsEditing(false);
  }, [open]);

  useEffect(() => {
    if (application) setIsEditing(false);
  }, [application?.id]);

  if (!application) return null;

  return (
    <DrawerShell open={open} onClose={onClose}>
      <div className="space-y-3">
        {/* Header / Edit */}
        {isEditing ? (
          <EditApplicationForm
            application={application}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false);
              onClose();
            }}
          />
        ) : (
          <div>
            <div className="text-lg font-semibold">{application.company}</div>
            <div className="text-sm opacity-70">{application.role}</div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="mt-1 text-sm underline"
            >
              Edit
            </button>
          </div>
        )}

        {/* Sections */}
        <SectionBoundary title="Activities">
          <ActivitiesSection applicationId={application.id} />
        </SectionBoundary>

        <SectionBoundary title="Tasks">
          <TasksSection applicationId={application.id} />
        </SectionBoundary>

        <SectionBoundary title="Files">
          <FileSection applicationId={application.id} />
        </SectionBoundary>
      </div>
    </DrawerShell>
  );
}
