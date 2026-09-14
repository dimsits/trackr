"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { makeQueryClient } from "@/lib/queryClient";
import { ColdStartGate } from "@/components/ColdStartGate";
import { HEALTH_URL } from "@/lib/config";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => makeQueryClient());

  // Enable only in prod (optional: also allow an override env flag)
  const enabled = process.env.NODE_ENV === "production";

  return (
    <QueryClientProvider client={client}>
      <ColdStartGate healthUrl={HEALTH_URL} enabled={enabled}>
        {children}
      </ColdStartGate>
    </QueryClientProvider>
  );
}