"use client";

import Link from "next/link";
import { useWorkspaces } from "@/hooks/useWorkspaces";

export default function WorkspacesPage() {
  const { data, isLoading, error } = useWorkspaces();

  if (isLoading) return <div className="p-6">Loading workspaces...</div>;
  if (error) return <div className="p-6">Failed to load workspaces</div>;

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Workspaces</h1>
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
    </div>
  );
}
