"use client";

import { ArrowRightLeft, Award, History, Mail, Phone, StickyNote, Users } from "lucide-react";
import { useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Textarea } from "@/components/ui/Field";
import { useActivities } from "@/hooks/useActivities";
import { useCreateActivity } from "@/hooks/useCreateActivity";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import type { Activity, ActivityType, Stage } from "@/types";
import { SectionError, SectionLoading } from "./SectionStates";

const MAX_NOTE = 500;

const TYPE_META: Record<ActivityType, { label: string; icon: React.ReactNode }> = {
  NOTE: { label: "Note", icon: <StickyNote /> },
  STAGE_MOVED: { label: "Stage change", icon: <ArrowRightLeft /> },
  INTERVIEW: { label: "Interview", icon: <Users /> },
  EMAIL: { label: "Email", icon: <Mail /> },
  CALL: { label: "Call", icon: <Phone /> },
  OFFER: { label: "Offer", icon: <Award /> },
};

function stageMoveTitle(activity: Activity, stages: Stage[]) {
  const data = activity.data as { fromStageId?: unknown; toStageId?: unknown } | null;
  const nameOf = (id: unknown) => stages.find((stage) => stage.id === id)?.name;
  const from = nameOf(data?.fromStageId);
  const to = nameOf(data?.toStageId);
  if (from && to) return `Moved from ${from} to ${to}`;
  if (to) return `Moved to ${to}`;
  return "Moved to another stage";
}

export default function ActivitiesSection({ applicationId, stages }: { applicationId: string; stages: Stage[] }) {
  const activitiesQ = useActivities(applicationId);
  const createM = useCreateActivity(applicationId);
  const [note, setNote] = useState("");
  const trimmed = note.trim();

  async function submit() {
    if (!trimmed || createM.isPending) return;
    try {
      await createM.mutateAsync(trimmed);
      setNote("");
    } catch {
      // Surfaced through createM.error below.
    }
  }

  const activities = (activitiesQ.data ?? []).slice().reverse();

  return (
    <div className="space-y-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="space-y-2"
      >
        <Field label="Add a note" hint="Press Ctrl + Enter to save.">
          <Textarea
            rows={3}
            value={note}
            maxLength={MAX_NOTE}
            onChange={(event) => setNote(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder="Recruiter call, interview questions, what to follow up on…"
          />
        </Field>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs tabular-nums text-text-muted" aria-live="polite">
            {note.length > MAX_NOTE - 80 ? `${MAX_NOTE - note.length} characters left` : ""}
          </span>
          <Button type="submit" size="sm" loading={createM.isPending} disabled={!trimmed}>
            {createM.isPending ? "Saving…" : "Add note"}
          </Button>
        </div>
        {createM.isError && <Alert>{getErrorMessage(createM.error, "We couldn't save that note. Try again.")}</Alert>}
      </form>

      <section aria-label="Activity timeline">
        {activitiesQ.isLoading ? (
          <SectionLoading label="Loading activity" />
        ) : activitiesQ.isError ? (
          <SectionError
            message="We couldn't load the activity for this application."
            onRetry={() => activitiesQ.refetch()}
            retrying={activitiesQ.isFetching}
          />
        ) : activities.length === 0 ? (
          <EmptyState
            variant="inline"
            headingLevel="h3"
            icon={<History />}
            title="No activity yet"
            description="Notes you add and stage moves on the board will appear here, newest first."
          />
        ) : (
          <ol className="relative">
            {activities.map((activity, index) => {
              const meta = TYPE_META[activity.type] ?? TYPE_META.NOTE;
              const isMove = activity.type === "STAGE_MOVED";
              const isLast = index === activities.length - 1;
              return (
                <li key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
                  {!isLast && (
                    <span aria-hidden="true" className="absolute bottom-0 left-[15px] top-9 w-px bg-border" />
                  )}
                  <span
                    aria-hidden="true"
                    className={
                      isMove
                        ? "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand [&_svg]:size-4"
                        : "relative flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-muted [&_svg]:size-4"
                    }
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <p className="text-[13px] font-semibold leading-5 text-text">
                      {isMove ? stageMoveTitle(activity, stages) : meta.label}
                    </p>
                    {activity.content && (
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-text [overflow-wrap:anywhere]">
                        {activity.content}
                      </p>
                    )}
                    <time dateTime={activity.createdAt} className="mt-1 block text-xs text-text-muted">
                      {formatDateTime(activity.createdAt)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
