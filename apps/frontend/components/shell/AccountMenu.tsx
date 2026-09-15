"use client";

import { ChevronDown, LayoutGrid, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Menu, { MenuHeader, MenuItem, MenuSeparator } from "@/components/ui/Menu";
import { useLogout } from "@/hooks/useLogout";
import { useMe } from "@/hooks/useMe";
import { getInitials } from "@/lib/format";

export default function AccountMenu() {
  const { data: me } = useMe();
  const logout = useLogout();
  const router = useRouter();

  const displayName = me?.name?.trim() || me?.email || "Account";

  return (
    <Menu
      trigger={(props) => (
        <button
          {...props}
          type="button"
          aria-label={`Account menu for ${displayName}`}
          className="flex h-10 items-center gap-2 rounded-control py-1 pl-1 pr-2 transition-colors duration-150 hover:bg-surface-muted aria-expanded:bg-surface-muted"
        >
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-ink"
          >
            {getInitials(me?.name || me?.email)}
          </span>
          <span className="hidden max-w-44 truncate text-sm font-semibold text-text md:block">{displayName}</span>
          <ChevronDown aria-hidden="true" className="size-4 text-text-muted" />
        </button>
      )}
    >
      <MenuHeader>
        <p className="truncate text-sm font-bold text-text">{me?.name?.trim() || "Signed in"}</p>
        {me?.email && <p className="truncate text-xs text-text-muted">{me.email}</p>}
      </MenuHeader>
      <MenuSeparator />
      <MenuItem onSelect={() => router.push("/workspaces")}>
        <LayoutGrid aria-hidden="true" />
        All workspaces
      </MenuItem>
      <MenuItem onSelect={logout}>
        <LogOut aria-hidden="true" />
        Log out
      </MenuItem>
    </Menu>
  );
}
