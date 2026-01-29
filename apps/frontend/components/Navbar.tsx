"use client";

import { useLogout } from "@/hooks/useLogout";

export default function Navbar() {
  const logout = useLogout();

  return (
    <header className="h-12 px-4 flex items-center justify-between border-b">
      <div className="font-semibold">Trackr</div>
      <button
        onClick={logout}
        className="text-sm opacity-70 hover:opacity-100"
      >
        Logout
      </button>
    </header>
  );
}
