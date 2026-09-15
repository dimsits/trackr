import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "brand" | "attention" | "danger" | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-text-muted",
  brand: "bg-brand-soft text-brand-ink",
  attention: "bg-attention-soft text-attention-ink",
  danger: "bg-danger-soft text-danger-ink",
  outline: "border border-border bg-surface text-text-muted",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  icon?: React.ReactNode;
};

export default function Badge({ tone = "neutral", icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full shrink-0 items-center gap-1 rounded-full px-2 text-xs font-semibold leading-none",
        "[&_svg]:size-3.5 [&_svg]:shrink-0",
        tones[tone],
        className
      )}
      {...props}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}
