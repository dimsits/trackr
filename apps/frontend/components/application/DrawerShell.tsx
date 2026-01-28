"use client";

import { ReactNode } from "react";

export default function DrawerShell({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div
        className="flex-1 bg-black/30"
        onClick={onClose}
      />

      {/* drawer */}
      <div className="w-[420px] bg-white border-l p-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
