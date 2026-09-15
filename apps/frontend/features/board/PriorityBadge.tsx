import { SignalHigh, SignalLow, SignalMedium, TriangleAlert } from "lucide-react";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import type { ApplicationPriority, ApplicationStatus } from "@/types";

export const PRIORITY_LABELS: Record<ApplicationPriority, string> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const PRIORITY_STYLE: Record<ApplicationPriority, { tone: BadgeTone; icon: React.ReactNode }> = {
  URGENT: { tone: "danger", icon: <TriangleAlert aria-hidden="true" /> },
  HIGH: { tone: "attention", icon: <SignalHigh aria-hidden="true" /> },
  MEDIUM: { tone: "neutral", icon: <SignalMedium aria-hidden="true" /> },
  LOW: { tone: "outline", icon: <SignalLow aria-hidden="true" /> },
};

/** Priority is always spelled out; colour and icon only reinforce it. */
export default function PriorityBadge({ priority }: { priority: ApplicationPriority }) {
  const style = PRIORITY_STYLE[priority];
  return (
    <Badge tone={style.tone} icon={style.icon}>
      {PRIORITY_LABELS[priority]}
      <span className="sr-only"> priority</span>
    </Badge>
  );
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  CLOSED: "Closed",
};
