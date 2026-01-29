"use client";

import type { Application } from "@/hooks/useApplications";
import { useState } from 'react';
import DrawerShell from "./DrawerShell";
import DrawerSection from "./DrawerSection";
import ActivitiesSection from "./ActivitiesSection";
import SectionBoundary from "./SectionBoundary";
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
  if (!application) return null;

  const [isEditing, setIsEditing] = useState(false);


  return (
    <DrawerShell open={open} onClose={onClose}>
      <div className="space-y-3">
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
            <div className="text-lg font-semibold">
              {application.company}
            </div>
            <div className="text-sm opacity-70">
              {application.role}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm undermline mt-1"
            >Edit</button>
        </div>
        )}
        <div>
          <div className="text-lg font-semibold">
            {application.company}
          </div>
          <div className="text-sm opacity-70">
            {application.role}
          </div>
        </div>
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
