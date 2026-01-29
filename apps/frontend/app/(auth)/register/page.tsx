// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegister } from "@/hooks/useRegister";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await register.mutateAsync({ email, password, name: name || undefined });
    router.push("/workspaces");
  }

  return (
    <div className="mx-auto max-w-sm p-6 space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-sm opacity-70">
          Register to start using Trackr.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1">
          <div className="text-sm">Name (optional)</div>
          <input
            className="w-full rounded border px-3 py-2 bg-transparent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </label>

        <label className="block space-y-1">
          <div className="text-sm">Email</div>
          <input
            className="w-full rounded border px-3 py-2 bg-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="block space-y-1">
          <div className="text-sm">Password</div>
          <input
            className="w-full rounded border px-3 py-2 bg-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </label>

        {register.isError && (
          <div className="text-sm text-red-500">
            {(register.error as any)?.message ?? "Registration failed"}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded bg-black text-white px-3 py-2 disabled:opacity-50"
          disabled={register.isPending}
        >
          {register.isPending ? "Creating..." : "Create account"}
        </button>
      </form>

      <div className="text-sm">
        Already have an account?{" "}
        <Link className="underline" href="/login">
          Log in
        </Link>
      </div>
    </div>
  );
}
