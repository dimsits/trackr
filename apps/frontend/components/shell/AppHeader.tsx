"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Logo from "@/components/brand/Logo";
import Skeleton from "@/components/ui/Skeleton";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import AccountMenu from "./AccountMenu";

export default function AppHeader() {
  const params = useParams<{ workspaceId?: string }>();
  const workspaceId = params?.workspaceId;
  const workspacesQ = useWorkspaces();
  const workspace = workspaceId ? workspacesQ.data?.find((w) => w.id === workspaceId) : undefined;

  return (
    <header className="relative z-30 h-[60px] shrink-0 border-b border-border bg-surface">
      <div className="flex h-full items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Link href="/workspaces" aria-label="Trackr, all workspaces" className="-ml-1 shrink-0 rounded-control p-1">
          <Logo hideWordmarkOnMobile />
        </Link>

        <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border" />

        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex min-w-0 items-center gap-1 text-sm">
            <li className="shrink-0">
              {workspaceId ? (
                <Link
                  href="/workspaces"
                  className="rounded-md px-1.5 py-1 font-medium text-text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-text"
                >
                  Workspaces
                </Link>
              ) : (
                <span aria-current="page" className="px-1.5 py-1 font-semibold text-text">
                  Workspaces
                </span>
              )}
            </li>
            {workspaceId && (
              <li className="flex min-w-0 items-center gap-1">
                <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-text-subtle" />
                {workspace ? (
                  <span aria-current="page" className="truncate px-1.5 py-1 font-semibold text-text">
                    {workspace.name}
                  </span>
                ) : workspacesQ.isLoading ? (
                  <Skeleton className="h-4 w-28" />
                ) : (
                  <span aria-current="page" className="truncate px-1.5 py-1 font-semibold text-text">
                    Workspace
                  </span>
                )}
              </li>
            )}
          </ol>
        </nav>

        <AccountMenu />
      </div>
    </header>
  );
}
