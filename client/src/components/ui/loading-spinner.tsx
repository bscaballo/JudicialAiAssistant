import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-slate-300 border-t-blue-500",
        "h-6 w-6",
        className
      )}
    />
  );
}
