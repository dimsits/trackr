"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import Board from "@/components/board/Board";
import ApplicationDrawer from "@/components/application/ApplicationDrawer";
import Modal from "@/components/ui/Modal";
import CreatePipelineForm from "@/components/forms/CreatePipelineForm";

import { usePipelines } from "@/hooks/usePipelines";
import { useStages } from "@/hooks/useStages";
import { useApplications } from "@/hooks/useApplications";
import type { Application } from "@/hooks/useApplications";

import { useCreateApplication } from "@/hooks/useCreateApplication";
import { useUpdateApplication } from "@/hooks/useUpdateApplication";
import { useDeleteApplication } from "@/hooks/useDeleteApplication";

export default function WorkspaceBoardPage() {
  // --- router hooks ---
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const sp = useSearchParams();
  const router = useRouter();

  const pipelineIdFromUrl = sp.get("pipelineId") ?? "";

  // --- data hooks (MUST be called every render) ---
  const pipelinesQ = usePipelines(workspaceId);

  const chosenPipelineId = useMemo(() => {
    if (pipelineIdFromUrl) return pipelineIdFromUrl;
    const ps = pipelinesQ.data ?? [];
    return (ps.find((p) => p.isDefault) ?? ps[0])?.id ?? "";
  }, [pipelineIdFromUrl, pipelinesQ.data]);

  const stagesQ = useStages(chosenPipelineId);
  const appsQ = useApplications(workspaceId, chosenPipelineId);

  const sortedStages = useMemo(
    () => (stagesQ.data ?? []).slice().sort((a, b) => a.position - b.position),
    [stagesQ.data]
  );

  const sortedApps = useMemo(
    () =>
      (appsQ.data ?? [])
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [appsQ.data]
  );

  // --- write hooks (also must be unconditional) ---
  const createM = useCreateApplication(workspaceId, chosenPipelineId);
  const updateM = useUpdateApplication(workspaceId, chosenPipelineId);
  const deleteM = useDeleteApplication(workspaceId, chosenPipelineId);

  // --- local state hooks (unconditional) ---
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStageId, setNewStageId] = useState("");

  const [editing, setEditing] = useState<Application | null>(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // NEW: pipeline modal
  const [createPipelineOpen, setCreatePipelineOpen] = useState(false);

  // --- effects (unconditional) ---
  useEffect(() => {
    if (!pipelineIdFromUrl && chosenPipelineId) {
      router.replace(`/workspaces/${workspaceId}?pipelineId=${chosenPipelineId}`);
    }
  }, [pipelineIdFromUrl, chosenPipelineId, router, workspaceId]);

  useEffect(() => {
    if (!newStageId && sortedStages.length > 0) setNewStageId(sortedStages[0].id);
  }, [newStageId, sortedStages]);

  // -------------------------
  // GUARDS (AFTER ALL HOOKS)
  // -------------------------
  if (pipelinesQ.isLoading) {
    return <div className="min-h-screen bg-white p-6">Loading pipelines...</div>;
  }

  if (pipelinesQ.isError) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="font-medium text-red-600">Failed to load pipelines</div>
        <pre className="mt-2 text-xs whitespace-pre-wrap">
          {JSON.stringify(pipelinesQ.error, null, 2)}
        </pre>
      </div>
    );
  }

  const pipelines = pipelinesQ.data ?? [];

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim() || !newStageId) return;

    await createM.mutateAsync({
      stageId: newStageId,
      company: newCompany.trim(),
      role: newRole.trim(),
    });

    setNewCompany("");
    setNewRole("");
  }

  function openEdit(app: Application) {
    setEditing(app);
    setEditCompany(app.company ?? "");
    setEditRole(app.role ?? "");
  }

  function closeEdit() {
    setEditing(null);
  }

  async function saveEdit() {
    if (!editing) return;

    await updateM.mutateAsync({
      id: editing.id,
      data: {
        company: editCompany.trim(),
        role: editRole.trim(),
      },
    });

    closeEdit();
  }

  async function deleteEditing() {
    if (!editing) return;
    if (!confirm("Delete this application?")) return;

    await deleteM.mutateAsync(editing.id);
    closeEdit();
  }

  function openDrawer(app: Application) {
    setSelectedApp(app);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <div className="min-h-screen bg-white p-6 space-y-5">
      {/* Header */}
      <div className="flex gap-2 items-center">
        <h1 className="text-xl font-semibold">Board</h1>

        <select
          className="border p-2"
          value={chosenPipelineId}
          onChange={(e) =>
            router.push(`/workspaces/${workspaceId}?pipelineId=${e.target.value}`)
          }
          disabled={pipelines.length === 0}
        >
          {pipelines.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <button
          className="border p-2"
          type="button"
          onClick={() => setCreatePipelineOpen(true)}
        >
          + Pipeline
        </button>
      </div>

      {/* If no pipelines, just prompt user to create one */}
      {pipelines.length === 0 ? (
        <div className="border p-4">
          <div className="font-medium">No pipelines found</div>
          <div className="text-sm opacity-70 mt-1">
            Create a pipeline to start tracking applications.
          </div>
          <button
            className="mt-3 border p-2"
            type="button"
            onClick={() => setCreatePipelineOpen(true)}
          >
            Create pipeline
          </button>
        </div>
      ) : (
        <>
          {/* Create application (minimal) */}
          <form className="border p-3 space-y-2" onSubmit={submitCreate}>
            <div className="font-medium">Add application</div>

            <div className="flex flex-wrap gap-2">
              <input
                className="border p-2"
                placeholder="Company"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
              />

              <input
                className="border p-2"
                placeholder="Role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              />

              <select
                className="border p-2"
                value={newStageId}
                onChange={(e) => setNewStageId(e.target.value)}
              >
                {sortedStages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <button className="border p-2" type="submit" disabled={createM.isPending}>
                {createM.isPending ? "Creating..." : "Create"}
              </button>
            </div>

            {(createM.error as any)?.message && (
              <div className="text-sm text-red-600">
                {(createM.error as any).message}
              </div>
            )}
          </form>

          <Board
            stages={sortedStages}
            applications={sortedApps}
            loading={stagesQ.isLoading || appsQ.isLoading}
            workspaceId={workspaceId}
            pipelineId={chosenPipelineId}
            onCardClick={openDrawer}
          />

          {/* Minimal edit panel (ugly by design) */}
          {editing && (
            <div className="border p-3 space-y-2">
              <div className="font-medium">Edit application</div>

              <input
                className="border p-2 w-full"
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                placeholder="Company"
              />
              <input
                className="border p-2 w-full"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                placeholder="Role"
              />

              <div className="flex gap-2">
                <button
                  className="border p-2"
                  onClick={saveEdit}
                  disabled={updateM.isPending}
                  type="button"
                >
                  {updateM.isPending ? "Saving..." : "Save"}
                </button>

                <button className="border p-2" onClick={closeEdit} type="button">
                  Close
                </button>

                <button
                  className="border p-2"
                  onClick={deleteEditing}
                  disabled={deleteM.isPending}
                  type="button"
                >
                  {deleteM.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>

              {(updateM.error as any)?.message && (
                <div className="text-sm text-red-600">
                  {(updateM.error as any).message}
                </div>
              )}
              {(deleteM.error as any)?.message && (
                <div className="text-sm text-red-600">
                  {(deleteM.error as any).message}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ApplicationDrawer application={selectedApp} open={drawerOpen} onClose={closeDrawer} />

      {/* Create pipeline modal */}
      <Modal
        open={createPipelineOpen}
        onClose={() => setCreatePipelineOpen(false)}
        ariaLabel="Create pipeline"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-lg font-semibold">Create pipeline</div>
            <div className="text-sm opacity-70">
              Pipelines contain stages and applications.
            </div>
          </div>

          <CreatePipelineForm
            workspaceId={workspaceId}
            onCancel={() => setCreatePipelineOpen(false)}
            onCreated={(pipelineId) => {
              setCreatePipelineOpen(false);
              router.push(`/workspaces/${workspaceId}?pipelineId=${pipelineId}`);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
