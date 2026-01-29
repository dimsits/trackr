"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

type RegisterInput = {
  email: string;
  password: string;
  name?: string;
};

type AuthResponse = { accessToken: string };

export function useRegister() {
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const res = await api<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      auth.setToken(res.accessToken);
      return res;
    },
  });
}
