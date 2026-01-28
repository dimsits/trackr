"use client";

import { useState } from "react";
import { useActivities } from "@/hooks/useActivities";
import { useCreateActivity } from "@/hooks/useCreateActivity";
import DrawerSection from "./DrawerSection";

export default function ActivitiesSection({
  applicationId,
}: {
  applicationId: string;
}) {
  const { data, isLoading, isError } = useActivities(applicationId);
  const createM = useCreateActivity(applicationId);

  const [note, setNote] = useState("");

  async function submit() {
    if (!note.trim()) return;
    await createM.mutateAsync(note.trim());
    setNote("");
  }

  return (
    <DrawerSection title="Activities">
      {isLoading && <div className="text-sm">Loading…</div>}
      {isError && (
        <div className="text-sm text-red-600">
          Failed to load activities
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-2">
          {data?.length === 0 && (
            <div className="text-sm opacity-60">No activity yet</div>
          )}

          {data?.map((a) => (
            <div key={a.id} className="border p-2 text-sm">
              <div>{a.content}</div>
              <div className="opacity-50 text-xs">
                {new Date(a.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* add note */}
      <div className="mt-3 space-y-2">
        <textarea
          className="border p-2 w-full text-sm"
          rows={3}
          placeholder="Add a note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          className="border px-3 py-1 text-sm"
          disabled={createM.isPending}
          onClick={submit}
        >
          {createM.isPending ? "Adding…" : "Add note"}
        </button>

        {(createM.error as any)?.message && (
          <div className="text-sm text-red-600">
            {(createM.error as any).message}
          </div>
        )}
      </div>
    </DrawerSection>
  );
}
