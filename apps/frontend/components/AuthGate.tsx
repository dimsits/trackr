"use client";

import { useMe } from "@/hooks/useMe";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isError } = useMe();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace(`/login?next=${encodeURIComponent(path)}`);
    }
  }, [isLoading, isError, router, path]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError) return null; // redirecting
  return <>{children}</>;
}
