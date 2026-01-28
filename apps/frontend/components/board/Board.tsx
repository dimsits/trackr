"use client";

import { useMemo, useState } from "react";
import type { Stage } from "@/hooks/useStages";
import type { Application } from "@/hooks/useApplications";
import { useCreateApplication } from "@/hooks/useCreateApplication";
import { useUpdateApplication } from "@/hooks/useUpdateApplication";
import { useDeleteApplication } from "@/hooks/useDeleteApplication";

type Props = {
  stages: Stage[];
  applications: Application[];
  loading: boolean;
  workspaceId: string;
  pipelineId: string;
};

export default function Board({
  stages,
  applications,
  loading,
  workspaceId,
  pipelineId,
}: Props) {
  const firstStageId = stages[0]?.id ?? "";

  // CREATE form (top of board)
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStageId, setNewStageId] = useState(firstStageId);

  // EDIT drawer (super ugly)
  const [editing, setEditing] = useState<Application | null>(null);
  const [editCompany, setEditCompany] = useState("");
  const [editRole, setEditRole] = useState("");

  const createM = useCreateApplication(workspaceId, pipelineId);
  const updateM = useUpdateApplication(workspaceId, pipelineId);
  const deleteM = useDeleteApplication(workspaceId, pipelineId);

  const stageMap = useMemo(() => {
    const map = new Map<string, Application[]>();
    for (const s of stages) map.set(s.id, []);
    for (const a of applications) {
      const bucket = map.get(a.stageId);
      if (bucket) bucket.push(a);
    }
    for (const [k, v] of map) v.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return map;
  }, [stages, applications]);

  if (loading) return <div className="p-2">Loading board...</div>;

  function openEdit(a: Application) {
    setEditing(a);
    setEditCompany(a.company ?? "");
    setEditRole(a.role ?? "");
  }

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

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    await updateM.mutateAsync({
      id: editing.id,
      data: {
        company: editCompany.trim(),
        role: editRole.trim(),
      },
    });

    setEditing(null);
  }

  async function doDelete() {
    if (!editing) return;
    const ok = confirm("Delete this application?");
    if (!ok) return;

    await deleteM.mutateAsync(editing.id);
    setEditing(null);
  }

  return (
    <div className="space-y-4">
      {/* CREATE (minimal) */}
      <form onSubmit={submitCreate} className="border p-3 space-y-2">
        <div className="font-medium">Add application (Phase 2 test)</div>

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
            {stages.map((s) => (
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

      {/* BOARD (read-only columns, clickable cards) */}
      <div className="flex gap-3 overflow-x-auto">
        {stages.map((s) => {
          const cards = stageMap.get(s.id) ?? [];
          return (
            <div key={s.id} className="min-w-[280px] border p-3">
              <div className="font-medium mb-2">{s.name}</div>

              <div className="space-y-2">
                {cards.map((a) => (
                  <button
                    key={a.id}
                    className="w-full text-left border p-2"
                    onClick={() => openEdit(a)}
                    type="button"
                  >
                    <div className="font-medium">{a.company}</div>
                    <div className="text-sm opacity-70">{a.role}</div>
                  </button>
                ))}

                {cards.length === 0 && <div className="text-sm opacity-50">Empty</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT (super minimal “drawer”) */}
      {editing && (
        <div className="border p-3 space-y-2">
          <div className="font-medium">Edit application (Phase 2 test)</div>

          <form onSubmit={submitEdit} className="space-y-2">
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
              <button className="border p-2" type="submit" disabled={updateM.isPending}>
                {updateM.isPending ? "Saving..." : "Save"}
              </button>

              <button className="border p-2" type="button" onClick={() => setEditing(null)}>
                Close
              </button>

              <button
                className="border p-2"
                type="button"
                onClick={doDelete}
                disabled={deleteM.isPending}
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
          </form>
        </div>
      )}
    </div>
  );
}
