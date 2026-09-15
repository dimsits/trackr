import { cn } from "@/lib/cn";

const radii = {
  control: "rounded-control",
  card: "rounded-card",
  lg: "rounded-lg",
  full: "rounded-full",
};

/** Decorative placeholder block. Wrap groups in an element with `role="status"` and a label. */
export default function Skeleton({ className, radius = "control" }: { className?: string; radius?: keyof typeof radii }) {
  return (
    <div aria-hidden="true" className={cn("bg-surface-sunken/80 motion-safe:animate-pulse", radii[radius], className)} />
  );
}
