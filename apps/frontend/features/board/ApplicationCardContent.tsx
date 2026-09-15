import { Banknote, MapPin, Radio } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Monogram from "@/components/ui/Monogram";
import { cn } from "@/lib/cn";
import { formatCompensation } from "@/lib/format";
import type { Application } from "@/types";
import PriorityBadge, { STATUS_LABELS } from "./PriorityBadge";

type Props = {
  application: Pick<
    Application,
    "company" | "role" | "location" | "source" | "priority" | "status" | "compMin" | "compMax"
  >;
  /** Controls rendered in the top-right corner (drag handle, external link). */
  actions?: React.ReactNode;
  /** Reserve room for `actions` so long text never slides underneath them. */
  actionsWidth?: "none" | "one" | "two";
  metaId?: string;
};

/**
 * Visual body of an application card, shared by the board, the drag overlay
 * and the marketing preview. Contains no interactivity of its own.
 */
export default function ApplicationCardContent({ application, actions, actionsWidth = "none", metaId }: Props) {
  const compensation = formatCompensation(application.compMin, application.compMax, "compact");
  const location = application.location?.trim();
  const source = application.source?.trim();

  return (
    <div className="relative p-3">
      <div
        className={cn(
          "flex items-start gap-2.5",
          actionsWidth === "one" && "pr-8",
          actionsWidth === "two" && "pr-16"
        )}
      >
        <Monogram name={application.company} size="sm" className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold leading-5 text-text-muted">{application.company}</p>
          <p className="line-clamp-2 text-sm font-bold leading-5 tracking-[-0.005em] text-text [overflow-wrap:anywhere]">
            {application.role}
          </p>
        </div>
      </div>

      <div id={metaId}>
        {(location || source) && (
          <p className="mt-2 flex min-w-0 items-center gap-3 text-xs leading-5 text-text-muted">
            {location && (
              <span className="flex min-w-0 items-center gap-1">
                <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                <span className="sr-only">Location: </span>
                <span className="truncate">{location}</span>
              </span>
            )}
            {source && (
              <span className="flex min-w-0 items-center gap-1">
                <Radio aria-hidden="true" className="size-3.5 shrink-0" />
                <span className="sr-only">Source: </span>
                <span className="truncate">{source}</span>
              </span>
            )}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={application.priority} />
          {application.status !== "ACTIVE" && <Badge tone="outline">{STATUS_LABELS[application.status]}</Badge>}
          {compensation && (
            <span className="ml-auto flex items-center gap-1 text-xs font-semibold tabular-nums text-text-muted">
              <Banknote aria-hidden="true" className="size-3.5" />
              <span className="sr-only">Compensation: </span>
              {compensation}
            </span>
          )}
        </div>
      </div>

      {actions && <div className="absolute right-2 top-2 flex items-center gap-0.5">{actions}</div>}
    </div>
  );
}
