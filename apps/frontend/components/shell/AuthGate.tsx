"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogoMark } from "@/components/brand/Logo";
import Spinner from "@/components/ui/Spinner";
import { useMe } from "@/hooks/useMe";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isError } = useMe();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace(`/login?next=${encodeURIComponent(path)}`);
    }
  }, [isLoading, isError, router, path]);

  if (isLoading || isError) {
    return (
      <div role="status" className="flex h-dvh flex-col items-center justify-center gap-4 bg-canvas">
        <LogoMark size="lg" />
        <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
          <Spinner />
          <span>{isError ? "Redirecting to sign in…" : "Loading your workspaces…"}</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
