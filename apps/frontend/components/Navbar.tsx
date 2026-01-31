"use client";

import Link from "next/link";
import { useLogout } from "@/hooks/useLogout";

export default function Navbar() {
  const logout = useLogout();

  return (
    <header className="h-12 px-4 flex items-center justify-between border-b">
      <div className="font-semibold">Trackr</div>

      <div className="flex items-center gap-4 text-sm">
        <Link
          href="/workspaces"
          className="opacity-70 hover:opacity-100"
        >
          Workspaces
        </Link>

        <button
          onClick={logout}
          className="opacity-70 hover:opacity-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
