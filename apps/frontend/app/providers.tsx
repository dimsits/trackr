"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { makeQueryClient } from "@/lib/queryClient";
import { ColdStartGate } from "@/components/ColdStartGate";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => makeQueryClient());

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const healthUrl = `${apiBase.replace(/\/$/, "")}/health`;

  // Enable only in prod (optional: also allow an override env flag)
  const enabled = process.env.NODE_ENV === "production";

  return (
    <QueryClientProvider client={client}>
      <ColdStartGate healthUrl={healthUrl} enabled={enabled}>
        {children}
      </ColdStartGate>
    </QueryClientProvider>
  );
}