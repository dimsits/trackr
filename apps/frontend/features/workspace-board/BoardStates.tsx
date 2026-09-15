import { Columns3, Layers, Plus, RotateCw, Route } from "lucide-react";
import Link from "next/link";
import Button, { buttonStyles } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

export function BoardSkeleton() {
  return (
    <div role="status" aria-label="Loading board" className="h-full overflow-hidden">
      <div className="flex h-full gap-3 px-4 pb-4 sm:px-6 sm:pb-6">
        {[3, 2, 1, 2].map((cards, lane) => (
          <div key={lane} className="flex h-full w-[304px] shrink-0 flex-col gap-2 rounded-card bg-surface-muted p-2 sm:w-[316px]">
            <div className="flex items-center gap-2 px-1.5 pb-1 pt-1">
              <Skeleton className="size-2.5" radius="full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="ml-auto h-5 w-7" radius="full" />
            </div>
            {Array.from({ length: cards }, (_, card) => (
              <div key={card} className="rounded-card border border-border bg-surface p-3">
                <div className="flex gap-2.5">
                  <Skeleton className="size-7" radius="lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                <Skeleton className="mt-3 h-6 w-16" radius="full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StateFrame({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-start justify-center overflow-y-auto px-4 pb-8 pt-2 sm:px-6 sm:pt-6">{children}</div>;
}

export function NoPipelinesState({ onCreatePipeline }: { onCreatePipeline: () => void }) {
  return (
    <StateFrame>
      <EmptyState
        className="w-full max-w-xl"
        icon={<Route />}
        title="Set up your first pipeline"
        description="A pipeline is the path your applications follow, like Interested, Applied, Interview and Offer. Start with the standard stages and shape it as you go."
        actions={
          <Button onClick={onCreatePipeline}>
            <Plus aria-hidden="true" />
            Create pipeline
          </Button>
        }
      />
    </StateFrame>
  );
}

export function NoStagesState({ onCreatePipeline }: { onCreatePipeline: () => void }) {
  return (
    <StateFrame>
      <EmptyState
        className="w-full max-w-xl"
        icon={<Columns3 />}
        title="This pipeline has no stages"
        description="Applications live in stages, so there is nowhere to place them yet. Switch to another pipeline, or create a new one with the standard stages or your own."
        actions={
          <Button variant="secondary" onClick={onCreatePipeline}>
            <Layers aria-hidden="true" />
            Create pipeline
          </Button>
        }
      />
    </StateFrame>
  );
}

export function PipelineMissingState({ defaultHref }: { defaultHref: string | null }) {
  return (
    <StateFrame>
      <EmptyState
        className="w-full max-w-xl"
        icon={<Route />}
        title="That pipeline isn't available"
        description="It may have been removed, or the link points to a different workspace."
        actions={
          defaultHref ? (
            <Link href={defaultHref} className={buttonStyles()}>
              Open default pipeline
            </Link>
          ) : (
            <Link href="/workspaces" className={buttonStyles({ variant: "secondary" })}>
              Back to workspaces
            </Link>
          )
        }
      />
    </StateFrame>
  );
}

export function BoardErrorState({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <StateFrame>
      <EmptyState
        className="w-full max-w-xl"
        title="We couldn't load this board"
        description={message}
        actions={
          <>
            <Button variant="secondary" onClick={onRetry} loading={retrying}>
              {!retrying && <RotateCw aria-hidden="true" />}
              Try again
            </Button>
            <Link href="/workspaces" className={buttonStyles({ variant: "ghost" })}>
              Back to workspaces
            </Link>
          </>
        }
      />
    </StateFrame>
  );
}
