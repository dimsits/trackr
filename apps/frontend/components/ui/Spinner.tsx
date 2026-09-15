import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/** Decorative spinner. Pair it with visible or `sr-only` text. */
export default function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      aria-hidden="true"
      className={cn("size-4 shrink-0 motion-safe:animate-spin", className)}
    />
  );
}
