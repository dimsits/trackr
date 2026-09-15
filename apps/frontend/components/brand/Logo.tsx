import { cn } from "@/lib/cn";

/**
 * Trackr mark: three ascending lanes, a quiet nod to a pipeline moving
 * forward. Built from tokens so it follows the palette.
 */
export function LogoMark({
  className,
  tone = "brand",
  size = "md",
}: {
  className?: string;
  tone?: "brand" | "inverse";
  size?: "md" | "lg";
}) {
  const bar = cn("rounded-full", tone === "brand" ? "bg-on-brand" : "bg-brand", size === "md" ? "w-[4px]" : "w-[5px]");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-end justify-center shadow-xs",
        size === "md" ? "size-8 gap-[3px] rounded-[9px] pb-[8px]" : "size-11 gap-[4px] rounded-[12px] pb-[11px]",
        tone === "brand" ? "bg-brand" : "bg-surface",
        className
      )}
    >
      <span className={cn(bar, "opacity-65", size === "md" ? "h-[7px]" : "h-[10px]")} />
      <span className={cn(bar, "opacity-80", size === "md" ? "h-[11px]" : "h-[15px]")} />
      <span className={cn(bar, size === "md" ? "h-[15px]" : "h-[21px]")} />
    </span>
  );
}

export default function Logo({
  className,
  hideWordmarkOnMobile = false,
}: {
  className?: string;
  hideWordmarkOnMobile?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "text-[17px] font-extrabold tracking-[-0.02em] text-text",
          hideWordmarkOnMobile && "hidden sm:inline"
        )}
      >
        Trackr
      </span>
    </span>
  );
}
