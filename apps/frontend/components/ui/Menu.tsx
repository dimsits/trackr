"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type MenuContextValue = { close: (restoreFocus?: boolean) => void };
const MenuContext = createContext<MenuContextValue | null>(null);

export type MenuTriggerProps = {
  ref: React.RefObject<HTMLButtonElement | null>;
  id: string;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string | undefined;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
};

type MenuProps = {
  trigger: (props: MenuTriggerProps) => React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
  /** Width and other overrides for the menu surface. */
  menuClassName?: string;
};

function menuItems(menu: HTMLElement | null) {
  if (!menu) return [];
  return Array.from(
    menu.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemradio"]:not([aria-disabled="true"])'
    )
  );
}

/**
 * Accessible dropdown menu: arrow-key navigation, Home/End, Escape and Tab to
 * close, outside click dismissal, and focus returned to the trigger.
 */
export default function Menu({ trigger, children, align = "end", className, menuClassName = "w-64" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const focusOnOpen = useRef<"first" | "last">("first");
  const id = useId();
  const menuId = `${id}-menu`;
  const triggerId = `${id}-trigger`;

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const items = menuItems(menuRef.current);
    (focusOnOpen.current === "last" ? items[items.length - 1] : items[0])?.focus();

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusOnOpen.current = event.key === "ArrowUp" ? "last" : "first";
      setOpen(true);
    }
  }

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const items = menuItems(menuRef.current);
    const index = items.indexOf(document.activeElement as HTMLElement);
    let next: HTMLElement | undefined;

    switch (event.key) {
      case "ArrowDown":
        next = items[(index + 1) % items.length];
        break;
      case "ArrowUp":
        next = items[(index - 1 + items.length) % items.length];
        break;
      case "Home":
        next = items[0];
        break;
      case "End":
        next = items[items.length - 1];
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      case "Tab":
        close(false);
        return;
      default:
        return;
    }
    event.preventDefault();
    next?.focus();
  }

  return (
    <MenuContext.Provider value={{ close }}>
      <div className={cn("relative", className)}>
        {trigger({
          ref: triggerRef,
          id: triggerId,
          "aria-haspopup": "menu",
          "aria-expanded": open,
          "aria-controls": open ? menuId : undefined,
          onClick: () => {
            focusOnOpen.current = "first";
            setOpen((value) => !value);
          },
          onKeyDown: onTriggerKeyDown,
        })}

        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-labelledby={triggerId}
              onKeyDown={onMenuKeyDown}
              className={cn(
                "absolute top-[calc(100%+8px)] z-40 origin-top overflow-hidden rounded-card border border-border bg-surface p-1.5 shadow-raised",
                align === "end" ? "right-0" : "left-0",
                menuClassName
              )}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MenuContext.Provider>
  );
}

const itemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium text-text outline-none " +
  "transition-colors duration-150 hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none " +
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-text-muted";

export function MenuItem({
  onSelect,
  children,
  tone = "default",
  checked,
}: {
  onSelect: () => void;
  children: React.ReactNode;
  tone?: "default" | "danger";
  /** Makes the item a `menuitemradio` reflecting a current choice. */
  checked?: boolean;
}) {
  const menu = useContext(MenuContext);
  const isRadio = checked !== undefined;
  return (
    <button
      type="button"
      role={isRadio ? "menuitemradio" : "menuitem"}
      aria-checked={isRadio ? checked : undefined}
      tabIndex={-1}
      className={cn(itemClass, tone === "danger" && "text-danger [&_svg]:text-danger")}
      onClick={() => {
        menu?.close();
        onSelect();
      }}
    >
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="my-1.5 h-px bg-border" />;
}

/** Non-interactive content at the top of a menu, e.g. account identity. */
export function MenuHeader({ children }: { children: React.ReactNode }) {
  return (
    <div role="presentation" className="px-2.5 pb-2 pt-1.5">
      {children}
    </div>
  );
}
