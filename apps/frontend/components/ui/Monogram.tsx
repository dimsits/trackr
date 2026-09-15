import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/format";

const tiles = [
  "bg-tile-green-bg text-tile-green-fg",
  "bg-tile-amber-bg text-tile-amber-fg",
  "bg-tile-blue-bg text-tile-blue-fg",
  "bg-tile-rose-bg text-tile-rose-fg",
  "bg-tile-slate-bg text-tile-slate-fg",
];

function tileFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return tiles[hash % tiles.length];
}

const sizes = {
  sm: "size-7 rounded-lg text-[11px]",
  md: "size-9 rounded-[10px] text-[13px]",
  lg: "size-11 rounded-card text-[15px]",
};

/** Decorative identity tile derived from a name. Hidden from assistive tech. */
export default function Monogram({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center font-bold tracking-tight",
        sizes[size],
        tileFor(name.trim().toLowerCase()),
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}
