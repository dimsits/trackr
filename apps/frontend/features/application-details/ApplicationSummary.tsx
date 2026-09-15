import { ArrowUpRight } from "lucide-react";
import { formatCompensation, formatDate, getHostname, toSafeHref } from "@/lib/format";
import type { Application } from "@/types";

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium leading-6 text-text [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

function NotSet() {
  return <span className="font-normal text-text-subtle">Not set</span>;
}

export default function ApplicationSummary({ application }: { application: Application }) {
  const compensation = formatCompensation(application.compMin, application.compMax, "full");
  const href = toSafeHref(application.link);

  return (
    <div className="px-5 py-5 sm:px-6">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-card border border-border bg-surface-muted/50 p-4">
        <Detail label="Location">{application.location?.trim() || <NotSet />}</Detail>
        <Detail label="Source">{application.source?.trim() || <NotSet />}</Detail>
        <Detail label="Compensation">
          {compensation ? <span className="tabular-nums">{compensation}</span> : <NotSet />}
        </Detail>
        <Detail label="Posting">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1 rounded-sm font-semibold text-brand underline-offset-2 hover:underline"
            >
              <span className="truncate">{getHostname(href)}</span>
              <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : (
            <NotSet />
          )}
        </Detail>
      </dl>
      <p className="mt-3 text-xs text-text-muted">
        Added {formatDate(application.createdAt)}
        {application.updatedAt !== application.createdAt && <> · Updated {formatDate(application.updatedAt)}</>}
      </p>
    </div>
  );
}
