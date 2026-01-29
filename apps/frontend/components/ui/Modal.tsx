"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Modal({
  open,
  onClose,
  children,
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const panelRef = useRef<HTMLDivElement | null>(null);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // focus panel when opened
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.button
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal container */}
          <div className="relative mx-auto mt-24 w-[92vw] max-w-md">
            <motion.div
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby={ariaLabel ? undefined : labelId}
              aria-label={ariaLabel}
              className="rounded-lg border bg-white p-4 shadow outline-none"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.18,
                  ease: "easeOut",
                },
              }}
              exit={{
                opacity: 0,
                y: 24,
                scale: 0.96,
                transition: {
                  duration: 0.15,
                  ease: "easeIn",
                },
              }}
            >
              {!ariaLabel && (
                <span id={labelId} className="sr-only">
                  Dialog
                </span>
              )}
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
