"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePipelines } from "@/hooks/usePipelines";
import { useStages } from "@/hooks/useStages";
import { useApplications } from "@/hooks/useApplications";
import Board from "@/components/board/Board";
import { useEffect, useMemo } from "react";

export default function WorkspaceBoardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const sp = useSearchParams();
  const router = useRouter();

  const pipelineIdFromUrl = sp.get("pipelineId") ?? "";

  const pipelinesQ = usePipelines(workspaceId);
  const chosenPipelineId = useMemo(() => {
    if (pipelineIdFromUrl) return pipelineIdFromUrl;
    const ps = pipelinesQ.data ?? [];
    return (ps.find((p) => p.isDefault) ?? ps[0])?.id ?? "";
  }, [pipelineIdFromUrl, pipelinesQ.data]);

  // keep URL in sync so refresh is stable
  useEffect(() => {
    if (!pipelineIdFromUrl && chosenPipelineId) {
      router.replace(`/workspaces/${workspaceId}?pipelineId=${chosenPipelineId}`);
    }
  }, [pipelineIdFromUrl, chosenPipelineId, router, workspaceId]);

  const stagesQ = useStages(chosenPipelineId);
  const appsQ = useApplications(workspaceId, chosenPipelineId);

  if (pipelinesQ.isLoading) return <div className="p-6">Loading pipelines...</div>;
  if (!chosenPipelineId) return <div className="p-6">No pipelines found.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2 items-center">
        <h1 className="text-xl font-semibold">Board</h1>
        <select
          className="border p-2"
          value={chosenPipelineId}
          onChange={(e) => router.push(`/workspaces/${workspaceId}?pipelineId=${e.target.value}`)}
        >
          {(pipelinesQ.data ?? []).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <Board
        stages={(stagesQ.data ?? []).slice().sort((a,b)=>a.position-b.position)}
        applications={(appsQ.data ?? []).slice().sort((a,b)=>a.position-b.position)}
        loading={stagesQ.isLoading || appsQ.isLoading}
      />
    </div>
  );
}
