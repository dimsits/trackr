"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import PasswordInput from "@/features/auth/PasswordInput";
import { useLogin } from "@/hooks/useLogin";
import { getErrorMessage } from "@/lib/errors";

/** Only follow same-origin paths, never an absolute or protocol-relative URL. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/workspaces";
}

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const errors = {
    email: email.trim() ? null : "Enter your email address.",
    password: password ? null : "Enter your password.",
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setShowErrors(true);
    if (errors.email || errors.password) return;

    try {
      await login.mutateAsync({ email: email.trim(), password });
      router.replace(next);
    } catch {
      // Surfaced through login.error below.
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-text sm:text-[28px]">Welcome back</h1>
      <p className="mt-1.5 text-[15px] leading-6 text-text-muted">Sign in to pick up where you left off.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
        <Field label="Email" error={showErrors && errors.email}>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password" error={showErrors && errors.password}>
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </Field>

        {login.isError && (
          <Alert>{getErrorMessage(login.error, "We couldn't sign you in. Check your details and try again.")}</Alert>
        )}

        <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-text-muted">
        New to Trackr?{" "}
        <Link href="/register" className="rounded-sm font-semibold text-brand underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
