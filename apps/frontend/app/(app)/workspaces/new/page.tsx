"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { api } from "@/lib/api";

type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

type WorkspaceListItem = {
  id: string;
  name: string;
  role: WorkspaceRole;
};

type CreateWorkspaceResponse =
  | WorkspaceListItem
  | { id: string; name: string };

export default function NewWorkspacePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await api<CreateWorkspaceResponse>("/workspaces", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });

      router.push(`/workspaces/${res.id}`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create workspace");
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-md space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">New workspace</h1>
        <p className="text-sm opacity-70">
          Create a workspace and start tracking applications.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1">
          <span className="text-sm">Workspace name</span>
          <input
            className="w-full rounded border px-3 py-2 bg-transparent"
            placeholder="e.g. Personal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </label>

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-black text-white px-3 py-2 disabled:opacity-50"
            disabled={submitting || !name.trim()}
          >
            {submitting ? "Creating..." : "Create"}
          </button>

          <Link
            href="/workspaces"
            className="rounded border px-3 py-2 hover:bg-black/5"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
