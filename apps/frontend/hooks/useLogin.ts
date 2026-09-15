"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";

type LoginInput = {
  email: string;
  password: string;
};

type AuthResponse = { accessToken: string };

export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const res = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
      auth.setToken(res.accessToken);
      return res;
    },
  });
}
