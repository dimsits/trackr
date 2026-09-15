"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import IconButton from "./IconButton";
import Overlay from "./Overlay";

const sizes = {
  sm: "sm:max-w-[420px]",
  md: "sm:max-w-[500px]",
  lg: "sm:max-w-[580px]",
};

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Actions pinned below the scrollable body. Submit buttons can use `form="<id>"`. */
  footer?: React.ReactNode;
  size?: keyof typeof sizes;
  /** `alertdialog` for confirmations that interrupt the user. */
  role?: "dialog" | "alertdialog";
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Hide the close button, e.g. while a destructive action is in flight. */
  hideClose?: boolean;
};

/**
 * Centered dialog on larger screens; a bottom-anchored panel on phones so
 * actions stay within thumb reach.
 */
export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  role = "dialog",
  initialFocusRef,
  hideClose = false,
}: DialogProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <Overlay
      open={open}
      onClose={onClose}
      initialFocusRef={initialFocusRef}
      containerClassName="items-end justify-center sm:items-center sm:p-6"
    >
      {({ panelRef }) => (
        <motion.div
          ref={panelRef}
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={cn(
            "pointer-events-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-panel bg-surface shadow-overlay outline-none",
            "sm:max-h-[min(85dvh,760px)] sm:rounded-panel",
            sizes[size]
          )}
          initial={{ opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.985 }}
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        >
          <div className="flex items-start gap-3 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-lg font-bold tracking-tight text-text">
                {title}
              </h2>
              {description && (
                <div id={descriptionId} className="mt-1 text-sm leading-6 text-text-muted">
                  {description}
                </div>
              )}
            </div>
            {!hideClose && (
              <IconButton label="Close dialog" onClick={onClose} className="-mr-2 -mt-1.5">
                <X />
              </IconButton>
            )}
          </div>

          <div className="scrollbar-calm relative min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>

          {footer && (
            <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pb-4">
              {footer}
            </div>
          )}
        </motion.div>
      )}
    </Overlay>
  );
}
