"use client";

import type { Stage } from "@/hooks/useStages";
import type { Application } from "@/hooks/useApplications";

export default function Board({
  stages,
  applications,
  loading,
}: {
  stages: Stage[];
  applications: Application[];
  loading: boolean;
}) {
  if (loading) return <div>Loading board...</div>;

  return (
    <div className="flex gap-3 overflow-x-auto">
      {stages.map((s) => {
        const cards = applications.filter((a) => a.stageId === s.id);
        return (
          <div key={s.id} className="min-w-[280px] border p-3">
            <div className="font-medium mb-2">{s.name}</div>
            <div className="space-y-2">
              {cards.map((a) => (
                <div key={a.id} className="border p-2">
                  <div className="font-medium">{a.company}</div>
                  <div className="text-sm opacity-70">{a.role}</div>
                </div>
              ))}
              {cards.length === 0 && (
                <div className="text-sm opacity-50">Empty</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
