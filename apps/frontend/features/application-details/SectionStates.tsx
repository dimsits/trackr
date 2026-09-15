import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

export function SectionLoading({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-start gap-3">
          <Skeleton className="size-8 shrink-0" radius="full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionError({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <Alert
      action={
        <Button size="sm" variant="secondary" onClick={onRetry} loading={retrying} className="-my-1">
          Retry
        </Button>
      }
    >
      {message}
    </Alert>
  );
}
