import type { Metadata } from "next";
import AppShell from "@/components/shell/AppShell";
import AuthGate from "@/components/shell/AuthGate";

export const metadata: Metadata = {
  title: "Workspaces",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
