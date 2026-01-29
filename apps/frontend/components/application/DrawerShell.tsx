"use client";

import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function DrawerShell({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  // Escape-to-close (recommended)
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            className="flex-1 bg-black/30"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />

          {/* Drawer */}
          <motion.div
            className="w-[420px] bg-white border-l p-4 overflow-y-auto"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
