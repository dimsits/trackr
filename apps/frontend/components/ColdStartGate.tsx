"use client";

import React, { useEffect, useMemo, useState } from "react";

type Status = "checking" | "ready" | "slow" | "failed";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: ctrl.signal,
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

export function ColdStartGate({
  children,
  healthUrl,
  enabled = true,
  slowAfterMs = 10_000,
  maxWaitMs = 45_000,
  intervalMs = 1500,
}: {
  children: React.ReactNode;
  healthUrl: string;
  enabled?: boolean;
  slowAfterMs?: number;
  maxWaitMs?: number;
  intervalMs?: number;
}) {
  const [status, setStatus] = useState<Status>(enabled ? "checking" : "ready");
  const [attempts, setAttempts] = useState(0);

  const startedAt = useMemo(() => Date.now(), []);

  async function probe() {
    setAttempts(0);
    setStatus("checking");

    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const elapsed = Date.now() - start;
      if (elapsed >= slowAfterMs && status !== "slow") setStatus("slow");

      try {
        setAttempts((a) => a + 1);
        const res = await fetchWithTimeout(healthUrl, 4000);
        if (res.ok) {
          setStatus("ready");
          return;
        }
      } catch {
        // ignore and retry
      }

      await sleep(intervalMs);
    }

    setStatus("failed");
  }

  useEffect(() => {
    if (!enabled) return;
    void probe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, healthUrl]);

  if (!enabled || status === "ready") return <>{children}</>;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <div className="text-lg font-semibold">Starting server…</div>

        <div className="mt-2 text-sm text-muted-foreground">
          {status === "checking" && "Waking up the backend (cold start)."}
          {status === "slow" && "Still waking up. Render cold starts can take a bit."}
          {status === "failed" && "Server didn’t respond in time."}
        </div>

        <div className="mt-4 flex items-center gap-3">
          {(status === "checking" || status === "slow") && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          <div className="text-xs text-muted-foreground">
            Attempts: {attempts} • Elapsed: {Math.floor((Date.now() - startedAt) / 1000)}s
          </div>
        </div>

        {status === "failed" && (
          <button
            onClick={() => void probe()}
            className="mt-5 w-full rounded-xl border px-4 py-2 text-sm font-medium"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}