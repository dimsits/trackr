"use client";

import { FolderKanban, Plus, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { useMe } from "@/hooks/useMe";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { getErrorMessage } from "@/lib/errors";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import WorkspaceCard from "./WorkspaceCard";

function WorkspaceGridSkeleton() {
  return (
    <div role="status" aria-label="Loading workspaces">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <li key={key} className="rounded-card border border-border bg-surface p-5 shadow-card">
            <div className="flex items-start justify-between">
              <Skeleton className="size-11" radius="card" />
              <Skeleton className="h-6 w-16" radius="full" />
            </div>
            <Skeleton className="mt-4 h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/3" />
            <Skeleton className="mt-8 h-4 w-24" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WorkspacesView() {
  const router = useRouter();
  const workspacesQ = useWorkspaces();
  const { data: me } = useMe();
  const [createOpen, setCreateOpen] = useState(false);

  const workspaces = workspacesQ.data ?? [];
  const showHeaderAction = workspacesQ.isSuccess && workspaces.length > 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-text sm:text-[28px]">Workspaces</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-text-muted sm:text-[15px]">
            Each workspace holds its own pipelines and applications. Choose one to open its board.
          </p>
        </div>
        {showHeaderAction && (
          <Button onClick={() => setCreateOpen(true)} className="self-start sm:self-auto">
            <Plus aria-hidden="true" />
            New workspace
          </Button>
        )}
      </div>

      <div className="mt-8">
        {workspacesQ.isLoading ? (
          <WorkspaceGridSkeleton />
        ) : workspacesQ.isError ? (
          <EmptyState
            title="We couldn't load your workspaces"
            description={getErrorMessage(workspacesQ.error, "Check your connection and try again.")}
            actions={
              <Button variant="secondary" onClick={() => workspacesQ.refetch()} loading={workspacesQ.isFetching}>
                {!workspacesQ.isFetching && <RotateCw aria-hidden="true" />}
                Try again
              </Button>
            }
          />
        ) : workspaces.length === 0 ? (
          <EmptyState
            icon={<FolderKanban />}
            title="Create your first workspace"
            description="Start with one for your current search. You can add pipelines for internships, OJT, or full-time roles inside it."
            actions={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus aria-hidden="true" />
                New workspace
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <li key={workspace.id} className="min-w-0">
                <WorkspaceCard workspace={workspace} isOwner={me?.id === workspace.ownerId} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateWorkspaceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(workspace) => {
          setCreateOpen(false);
          router.push(`/workspaces/${workspace.id}`);
        }}
      />
    </div>
  );
}
