"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useWorkspaces } from "@/hooks/useWorkspaces";
import { api } from "@/lib/api";
import Modal from "@/components/ui/Modal"; // adjust path if different

type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

type WorkspaceListItem = {
  id: string;
  name: string;
  role: WorkspaceRole;
};

type CreateWorkspaceResponse =
  | WorkspaceListItem
  | { id: string; name: string };

export default function WorkspacesPage() {
  const router = useRouter();
  const { data, isLoading, error } = useWorkspaces();

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openModal() {
    setFormError(null);
    setName("");
    setOpen(true);
  }

  function closeModal() {
    if (submitting) return;
    setOpen(false);
    setFormError(null);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await api<CreateWorkspaceResponse>("/workspaces", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });

      setSubmitting(false);
      setOpen(false);
      setName("");

      router.push(`/workspaces/${res.id}`);
    } catch (err: any) {
      setFormError(err?.message ?? "Failed to create workspace");
      setSubmitting(false);
    }
  }

  if (isLoading) return <div className="p-6">Loading workspaces...</div>;
  if (error) return <div className="p-6">Failed to load workspaces</div>;

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Workspaces</h1>

        {/* REPLACE the /workspaces/new link with a modal trigger */}
        <button className="text-sm underline" onClick={openModal}>
          Create workspace
        </button>
      </div>

      <ul className="space-y-2">
        {data?.map((w) => (
          <li key={w.id} className="border p-3">
            <Link href={`/workspaces/${w.id}`} className="font-medium">
              {w.name}
            </Link>
            <div className="text-sm opacity-70">{w.role}</div>
          </li>
        ))}
      </ul>

      <Modal open={open} onClose={closeModal} ariaLabel="Create workspace">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-lg font-semibold">Create workspace</div>
            <div className="text-sm opacity-70">
              Workspaces group your pipelines and applications.
            </div>
          </div>

          <form onSubmit={onCreate} className="space-y-3">
            <label className="block space-y-1">
              <div className="text-sm">Workspace name</div>
              <input
                className="w-full rounded border px-3 py-2 bg-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Personal"
                autoFocus
              />
            </label>

            {formError && (
              <div className="text-sm text-red-500">{formError}</div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded border px-3 py-2 hover:bg-black/5"
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-black text-white px-3 py-2 disabled:opacity-50"
                disabled={submitting || !name.trim()}
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
