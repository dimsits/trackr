"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import Overlay from "./Overlay";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  /** Id of the heading that names the sheet. */
  labelledBy: string;
  describedBy?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  children: React.ReactNode;
};

/**
 * Side sheet anchored to the right edge on desktop (≥1024px) and full-screen
 * on tablets and phones. Content owns its own header and scroll regions.
 */
export default function Sheet({
  open,
  onClose,
  labelledBy,
  describedBy,
  initialFocusRef,
  className,
  children,
}: SheetProps) {
  return (
    <Overlay open={open} onClose={onClose} initialFocusRef={initialFocusRef} containerClassName="justify-end">
      {({ panelRef }) => (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          tabIndex={-1}
          className={cn(
            "pointer-events-auto flex h-full w-full flex-col overflow-hidden bg-surface shadow-overlay outline-none",
            "lg:max-w-[520px] lg:rounded-l-panel lg:border-l lg:border-border",
            className
          )}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
        >
          {children}
        </motion.div>
      )}
    </Overlay>
  );
}
