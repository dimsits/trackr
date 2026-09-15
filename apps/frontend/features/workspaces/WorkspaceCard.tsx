import { ArrowRight, KeyRound, Users } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Monogram from "@/components/ui/Monogram";
import { formatDate } from "@/lib/format";
import type { Workspace } from "@/types";

export default function WorkspaceCard({ workspace, isOwner }: { workspace: Workspace; isOwner: boolean }) {
  return (
    <Link
      href={`/workspaces/${workspace.id}`}
      className="group flex h-full min-w-0 flex-col rounded-card border border-border bg-surface p-5 shadow-card transition-[border-color,box-shadow,transform] duration-150 ease-calm hover:-translate-y-px hover:border-border-strong hover:shadow-raised"
    >
      <div className="flex items-start justify-between gap-3">
        <Monogram name={workspace.name} size="lg" />
        {isOwner ? (
          <Badge tone="brand" icon={<KeyRound aria-hidden="true" />}>
            Owner
          </Badge>
        ) : (
          <Badge tone="outline" icon={<Users aria-hidden="true" />}>
            Shared with you
          </Badge>
        )}
      </div>

      <h2 className="mt-4 line-clamp-2 text-base font-bold leading-6 tracking-tight text-text [overflow-wrap:anywhere]">
        {workspace.name}
      </h2>
      <p className="mt-1 text-[13px] text-text-muted">Created {formatDate(workspace.createdAt)}</p>

      <span className="mt-auto flex items-center justify-between gap-2 pt-6 text-sm font-semibold text-brand">
        Open board
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-150 ease-calm group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
