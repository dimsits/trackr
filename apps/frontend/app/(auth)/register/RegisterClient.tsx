"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import PasswordInput from "@/features/auth/PasswordInput";
import { useRegister } from "@/hooks/useRegister";
import { getErrorMessage } from "@/lib/errors";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterClient() {
  const router = useRouter();
  const register = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const errors = {
    email: !email.trim()
      ? "Enter your email address."
      : !EMAIL.test(email.trim())
        ? "Enter a valid email address, like you@example.com."
        : null,
    password: password.length < 8 ? "Use at least 8 characters." : null,
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setShowErrors(true);
    if (errors.email || errors.password) return;

    try {
      await register.mutateAsync({ email: email.trim(), password, name: name.trim() || undefined });
      router.push("/workspaces");
    } catch {
      // Surfaced through register.error below.
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-text sm:text-[28px]">Create your account</h1>
      <p className="mt-1.5 text-[15px] leading-6 text-text-muted">
        Set up Trackr in a minute and start with your first workspace.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4">
        <Field label="Name" optional>
          <Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
        </Field>

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

        <Field label="Password" hint="At least 8 characters." error={showErrors && errors.password}>
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </Field>

        {register.isError && (
          <Alert>{getErrorMessage(register.error, "We couldn't create your account. Try again.")}</Alert>
        )}

        <Button type="submit" size="lg" className="w-full" loading={register.isPending}>
          {register.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="rounded-sm font-semibold text-brand underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
