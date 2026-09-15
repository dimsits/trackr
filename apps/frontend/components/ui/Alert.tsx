import { CircleAlert, Info } from "lucide-react";
import { cn } from "@/lib/cn";

type AlertProps = {
  tone?: "danger" | "info";
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

/** Inline message for errors and notices. Errors are announced to assistive tech. */
export default function Alert({ tone = "danger", title, children, action, className }: AlertProps) {
  const Icon = tone === "danger" ? CircleAlert : Info;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-control px-3 py-2.5 text-[13px] leading-5",
        tone === "danger" ? "bg-danger-soft text-danger-ink" : "bg-brand-soft text-brand-ink",
        className
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1 break-words">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
