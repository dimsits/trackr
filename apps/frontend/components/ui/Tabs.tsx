"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

export type TabItem<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

export function tabIds(idBase: string, value: string) {
  return { tabId: `${idBase}-tab-${value}`, panelId: `${idBase}-panel-${value}` };
}

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Shared prefix so tabs and panels can reference each other. */
  idBase: string;
  label: string;
  className?: string;
};

/**
 * Segmented tab list following the WAI-ARIA tabs pattern: automatic
 * activation with arrow keys, Home and End, and a roving tab stop.
 */
export function Tabs<T extends string>({ items, value, onChange, idBase, label, className }: TabsProps<T>) {
  const buttons = useRef(new Map<T, HTMLButtonElement>());

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((item) => item.value === value);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % items.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const next = items[nextIndex].value;
    onChange(next);
    buttons.current.get(next)?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("flex gap-1 rounded-control bg-surface-muted p-1", className)}
    >
      {items.map((item) => {
        const selected = item.value === value;
        const { tabId, panelId } = tabIds(idBase, item.value);
        return (
          <button
            key={item.value}
            ref={(node) => {
              if (node) buttons.current.set(item.value, node);
              else buttons.current.delete(item.value);
            }}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold sm:h-9",
              "transition-[background-color,color,box-shadow] duration-150 ease-calm [&_svg]:size-4 [&_svg]:shrink-0",
              selected
                ? "bg-surface text-text shadow-card"
                : "text-text-muted hover:bg-surface/60 hover:text-text"
            )}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  idBase,
  value,
  className,
  children,
}: {
  idBase: string;
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { tabId, panelId } = tabIds(idBase, value);
  return (
    <div id={panelId} role="tabpanel" aria-labelledby={tabId} tabIndex={0} className={cn("outline-none", className)}>
      {children}
    </div>
  );
}
