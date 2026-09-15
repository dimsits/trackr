"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

/*
 * Shared behaviour for modal surfaces (Dialog, Sheet):
 * portal, scrim, Escape to close, focus trap, focus restore, scroll lock and
 * stacking, so a confirmation dialog opened from a sheet behaves correctly.
 */

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
  'select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable="true"], ' +
  '[tabindex]:not([tabindex="-1"])';

const overlayStack: symbol[] = [];

let scrollLocks = 0;
let savedBodyStyle: { overflow: string; paddingRight: string } | null = null;

function lockScroll() {
  if (scrollLocks === 0) {
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    savedBodyStyle = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
  }
  scrollLocks += 1;
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0 && savedBodyStyle) {
    document.body.style.overflow = savedBodyStyle.overflow;
    document.body.style.paddingRight = savedBodyStyle.paddingRight;
    savedBodyStyle = null;
  }
}

function getFocusable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0 && !el.closest("[inert]")
  );
}

const subscribeNoop = () => () => {};

/** `true` once rendering on the client, without a state update in an effect. */
function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

export type OverlayRenderProps = {
  panelRef: React.RefObject<HTMLDivElement | null>;
};

type OverlayProps = {
  open: boolean;
  onClose: () => void;
  /** Element to focus when opening. Defaults to `[data-autofocus]`, then the panel. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Positions the panel inside the viewport. Panels must opt back into pointer events. */
  containerClassName: string;
  children: (props: OverlayRenderProps) => React.ReactNode;
};

export default function Overlay({ open, onClose, initialFocusRef, containerClassName, children }: OverlayProps) {
  const isClient = useIsClient();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !isClient) return;

    const token = Symbol("overlay");
    overlayStack.push(token);
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockScroll();

    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) {
      const target =
        initialFocusRef?.current ?? panel.querySelector<HTMLElement>("[data-autofocus]") ?? panel;
      target.focus({ preventScroll: true });
    }

    function onKeyDown(event: KeyboardEvent) {
      if (overlayStack[overlayStack.length - 1] !== token) return;
      const current = panelRef.current;
      if (!current) return;

      if (event.key === "Escape" && !event.defaultPrevented) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusable(current);
      if (focusable.length === 0) {
        event.preventDefault();
        current.focus({ preventScroll: true });
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const outside = !current.contains(active);

      if (event.shiftKey && (active === first || active === current || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const index = overlayStack.indexOf(token);
      if (index >= 0) overlayStack.splice(index, 1);
      unlockScroll();
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open, isClient, initialFocusRef]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div key="overlay" className="fixed inset-0 z-50">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-scrim"
            onClick={() => onCloseRef.current()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          />
          <div className={cn("pointer-events-none absolute inset-0 flex", containerClassName)}>
            {children({ panelRef })}
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
