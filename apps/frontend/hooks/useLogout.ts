"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/auth";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    auth.logout();
    queryClient.clear(); // nukes /me, workspaces, everything
    router.replace("/");
  };
}
