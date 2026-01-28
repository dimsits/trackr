import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Me = { id: string; email: string; name: string; createdAt: string };

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api<Me>("/me"),
  });
}
