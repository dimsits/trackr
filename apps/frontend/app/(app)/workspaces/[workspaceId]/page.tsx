"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import ApplicationSheet from "@/features/application-details/ApplicationSheet";
import Board from "@/features/board/Board";
import BoardHeader from "@/features/workspace-board/BoardHeader";
import {
  BoardErrorState,
  BoardSkeleton,
  NoPipelinesState,
  NoStagesState,
  PipelineMissingState,
} from "@/features/workspace-board/BoardStates";
import CreateApplicationDialog from "@/features/workspace-board/CreateApplicationDialog";
import CreatePipelineDialog from "@/features/workspace-board/CreatePipelineDialog";
import { useBoardFilters } from "@/features/workspace-board/useBoardFilters";

import { useApplications } from "@/hooks/useApplications";
import { usePipelines } from "@/hooks/usePipelines";
import { useStages } from "@/hooks/useStages";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { getErrorMessage } from "@/lib/errors";

type OpenDialog = "application" | "pipeline" | null;

export default function WorkspaceBoardPage() {
  // --- route ---
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pipelineIdFromUrl = searchParams.get("pipelineId") ?? "";

  // --- queries ---
  const workspacesQ = useWorkspaces();
  const pipelinesQ = usePipelines(workspaceId);
  const pipelines = useMemo(() => pipelinesQ.data ?? [], [pipelinesQ.data]);

  const defaultPipelineId = (pipelines.find((p) => p.isDefault) ?? pipelines[0])?.id ?? "";
  const chosenPipelineId = pipelineIdFromUrl || defaultPipelineId;
  const pipeline = pipelines.find((p) => p.id === chosenPipelineId);
  const pipelineMissing = pipelinesQ.isSuccess && Boolean(chosenPipelineId) && !pipeline;
  const activePipelineId = pipelineMissing ? "" : chosenPipelineId;

  const stagesQ = useStages(activePipelineId);
  const appsQ = useApplications(workspaceId, activePipelineId);

  const stages = useMemo(
    () => (stagesQ.data ?? []).slice().sort((a, b) => a.position - b.position),
    [stagesQ.data]
  );
  const applications = useMemo(
    () => (appsQ.data ?? []).slice().sort((a, b) => a.position - b.position),
    [appsQ.data]
  );

  const filters = useBoardFilters(applications);
  const workspaceName = workspacesQ.data?.find((w) => w.id === workspaceId)?.name;

  // --- local UI state ---
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  // A new key per opening gives each dialog a fresh form.
  const [dialogKey, setDialogKey] = useState(0);

  const selectedApplication = selectedId ? applications.find((app) => app.id === selectedId) ?? null : null;

  const openApplication = useCallback((id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  }, []);

  function showDialog(dialog: Exclude<OpenDialog, null>) {
    setDialogKey((key) => key + 1);
    setOpenDialog(dialog);
  }

  function goToPipeline(pipelineId: string) {
    router.push(`/workspaces/${workspaceId}?pipelineId=${pipelineId}`);
  }

  // Canonicalise the URL once the default pipeline is known.
  useEffect(() => {
    if (!pipelineIdFromUrl && chosenPipelineId) {
      router.replace(`/workspaces/${workspaceId}?pipelineId=${chosenPipelineId}`);
    }
  }, [pipelineIdFromUrl, chosenPipelineId, router, workspaceId]);

  // --- board region ---
  const boardLoading = stagesQ.isLoading || appsQ.isLoading;
  const boardError = stagesQ.isError || appsQ.isError;
  const boardReady = Boolean(pipeline) && !boardLoading && !boardError && stages.length > 0;

  let content: React.ReactNode;
  if (pipelinesQ.isLoading) {
    content = <BoardSkeleton />;
  } else if (pipelinesQ.isError) {
    content = (
      <BoardErrorState
        message={getErrorMessage(pipelinesQ.error, "Check your connection and try again.")}
        onRetry={() => pipelinesQ.refetch()}
        retrying={pipelinesQ.isFetching}
      />
    );
  } else if (pipelines.length === 0) {
    content = <NoPipelinesState onCreatePipeline={() => showDialog("pipeline")} />;
  } else if (pipelineMissing) {
    content = (
      <PipelineMissingState
        defaultHref={defaultPipelineId ? `/workspaces/${workspaceId}?pipelineId=${defaultPipelineId}` : null}
      />
    );
  } else if (boardLoading) {
    content = <BoardSkeleton />;
  } else if (boardError) {
    content = (
      <BoardErrorState
        message={getErrorMessage(stagesQ.error ?? appsQ.error, "Check your connection and try again.")}
        onRetry={() => {
          if (stagesQ.isError) stagesQ.refetch();
          if (appsQ.isError) appsQ.refetch();
        }}
        retrying={stagesQ.isFetching || appsQ.isFetching}
      />
    );
  } else if (stages.length === 0) {
    content = <NoStagesState onCreatePipeline={() => showDialog("pipeline")} />;
  } else {
    content = (
      <Board
        key={activePipelineId}
        stages={stages}
        applications={applications}
        workspaceId={workspaceId}
        pipelineId={activePipelineId}
        visibleIds={filters.visibleIds}
        selectedId={sheetOpen ? selectedId : null}
        onOpenApplication={openApplication}
      />
    );
  }

  return (
    <div className="flex h-full min-h-[34rem] flex-col">
      <BoardHeader
        workspaceName={workspaceName}
        pipelines={pipelines}
        pipeline={pipeline}
        loading={pipelinesQ.isLoading}
        onPipelineChange={goToPipeline}
        totalCount={boardReady ? applications.length : null}
        filters={filters}
        boardReady={boardReady}
        onAddApplication={() => showDialog("application")}
        onCreatePipeline={() => showDialog("pipeline")}
      />

      <div className="min-h-0 flex-1">{content}</div>

      <ApplicationSheet
        open={sheetOpen && selectedApplication !== null}
        application={selectedApplication}
        stages={stages}
        onClose={() => setSheetOpen(false)}
      />

      {boardReady && (
        <CreateApplicationDialog
          key={`application-${dialogKey}`}
          open={openDialog === "application"}
          onClose={() => setOpenDialog(null)}
          workspaceId={workspaceId}
          pipelineId={activePipelineId}
          stages={stages}
        />
      )}

      <CreatePipelineDialog
        key={`pipeline-${dialogKey}`}
        open={openDialog === "pipeline"}
        onClose={() => setOpenDialog(null)}
        workspaceId={workspaceId}
        onCreated={(pipelineId) => {
          setOpenDialog(null);
          goToPipeline(pipelineId);
        }}
      />
    </div>
  );
}
