import { ChevronDown, ChevronRight, Check, FileText, ListChecks, MessageSquareText, Search, X } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import Badge from "@/components/ui/Badge";
import Monogram from "@/components/ui/Monogram";
import ApplicationCardContent from "@/features/board/ApplicationCardContent";
import PriorityBadge from "@/features/board/PriorityBadge";
import { cn } from "@/lib/cn";
import { SAMPLE_DRAGGED, SAMPLE_LANES } from "./sampleData";

function FakeControl({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-8 items-center gap-2 rounded-lg border border-border-strong/70 bg-surface px-2.5 text-xs font-medium text-text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Static rendering of the real board, built from the same card component.
 * Decorative: it is described once for assistive tech and hidden inside.
 */
export default function ProductPreview() {
  const interview = SAMPLE_LANES[2].applications[0];

  return (
    <div
      role="img"
      aria-label="Preview of a Trackr board with Interested, Applied, Interview and Offer stages, and an application's task list open beside it."
      className="relative overflow-hidden rounded-panel border border-border bg-canvas shadow-overlay"
    >
      <div aria-hidden="true" className="select-none">
        {/* App header */}
        <div className="flex h-12 items-center gap-3 border-b border-border bg-surface px-4">
          <LogoMark className="scale-90" />
          <span className="h-4 w-px bg-border" />
          <span className="flex min-w-0 items-center gap-1 text-xs">
            <span className="font-medium text-text-muted">Workspaces</span>
            <ChevronRight className="size-3.5 text-text-subtle" />
            <span className="truncate font-semibold text-text">Internship search</span>
          </span>
          <span className="ml-auto flex size-7 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-ink">
            AR
          </span>
        </div>

        {/* Board header */}
        <div className="px-4 pb-3 pt-4">
          <p className="text-[11px] font-semibold text-text-muted">Internship search</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-text">Summer 2026</span>
            <Badge tone="brand">Default</Badge>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-card border border-border bg-surface p-1.5 shadow-card">
            <FakeControl className="w-36 justify-between">
              Summer 2026 <ChevronDown className="size-3.5" />
            </FakeControl>
            <FakeControl className="hidden w-44 sm:flex">
              <Search className="size-3.5" /> Search company or role
            </FakeControl>
            <FakeControl className="hidden w-28 justify-between md:flex">
              All priorities <ChevronDown className="size-3.5" />
            </FakeControl>
            <span className="ml-auto whitespace-nowrap px-1.5 text-[11px] font-semibold text-text-muted">7 applications</span>
          </div>
        </div>

        {/* Lanes */}
        <div className="flex gap-2.5 overflow-hidden px-4 pb-5 [mask-image:linear-gradient(to_right,black_80%,transparent)] lg:[mask-image:none]">
          {SAMPLE_LANES.map((lane, laneIndex) => (
            <div
              key={lane.name}
              className={cn(
                "w-[228px] shrink-0 rounded-card p-1.5",
                laneIndex === 2 ? "border border-brand/40 bg-brand-soft" : "bg-surface-muted"
              )}
            >
              <div className="flex items-center gap-2 px-2 pb-2 pt-1.5">
                <span className="size-2 rounded-full ring-2 ring-surface" style={{ backgroundColor: lane.color }} />
                <span className="text-xs font-bold text-text">{lane.name}</span>
                <span className="ml-auto rounded-full bg-surface px-1.5 text-[10px] font-semibold text-text-muted">
                  {lane.applications.length + (laneIndex === 2 ? 1 : 0)}
                </span>
              </div>
              <div className="space-y-1.5">
                {lane.applications.map((app) => (
                  <div
                    key={app.company}
                    className={cn(
                      "rounded-card border bg-surface",
                      app === interview ? "border-brand shadow-card-hover ring-1 ring-brand" : "border-border shadow-card"
                    )}
                  >
                    <ApplicationCardContent application={app} />
                  </div>
                ))}
                {laneIndex === 2 && (
                  <div className="relative">
                    <div className="h-[104px] rounded-card border border-dashed border-brand/45 bg-brand-soft/60" />
                    <div className="absolute -top-1.5 left-2 w-full scale-[1.02] rounded-card border border-brand/30 bg-surface shadow-raised">
                      <ApplicationCardContent application={SAMPLE_DRAGGED} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail sheet peek */}
        <div className="absolute inset-y-0 right-0 hidden w-[312px] flex-col border-l border-border bg-surface shadow-overlay xl:flex">
          <div className="border-b border-border p-4">
            <div className="flex items-start gap-2.5">
              <Monogram name={interview.company} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-text-muted">{interview.company}</p>
                <p className="text-sm font-extrabold leading-5 text-text">{interview.role}</p>
              </div>
              <X className="size-4 text-text-muted" />
            </div>
            <div className="mt-2.5 flex gap-1.5 pl-[46px]">
              <Badge tone="outline" icon={<span className="size-2 rounded-full bg-attention" />}>
                Interview
              </Badge>
              <PriorityBadge priority={interview.priority} />
            </div>
          </div>
          <div className="p-4">
            <div className="flex gap-1 rounded-control bg-surface-muted p-1 text-[11px] font-semibold">
              <span className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-text-muted">
                <MessageSquareText className="size-3.5" /> Activity
              </span>
              <span className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-surface py-1.5 text-text shadow-card">
                <ListChecks className="size-3.5" /> Tasks
              </span>
              <span className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-text-muted">
                <FileText className="size-3.5" /> Files
              </span>
            </div>
            <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.06em] text-text-muted">To do · 1</p>
            <div className="rounded-card border border-border px-3 py-2.5">
              <div className="flex gap-2.5">
                <span className="mt-0.5 size-4 shrink-0 rounded-[5px] border border-border-strong" />
                <div>
                  <p className="text-xs font-medium text-text">Prepare system design notes</p>
                  <p className="text-[11px] text-text-muted">Due Sep 22</p>
                </div>
              </div>
            </div>
            <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.06em] text-text-muted">Done · 2</p>
            <div className="divide-y divide-border rounded-card border border-border bg-surface-muted/50">
              {["Confirm interview time", "Send portfolio link"].map((task) => (
                <div key={task} className="flex items-center gap-2.5 px-3 py-2.5">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-[5px] bg-brand">
                    <Check className="size-3 text-on-brand" strokeWidth={3} />
                  </span>
                  <p className="text-xs font-medium text-text-muted line-through decoration-text-subtle">{task}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
