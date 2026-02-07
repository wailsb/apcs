import { cn } from "@/lib/utils";

interface StatusTextProps {
  arrived: boolean;
  scheduled?: boolean;
  className?: string;
}

export function StatusText({ arrived, scheduled, className }: StatusTextProps) {
  if (scheduled) {
    return (
      <span className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium",
        "glass-pill-scheduled",
        className
      )}>
        Scheduled
      </span>
    );
  }
  
  if (arrived) {
    return (
      <span className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium",
        "glass-pill-arrived",
        className
      )}>
        Container Arrived
      </span>
    );
  }
  
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium",
      "glass-pill-not-arrived",
      className
    )}>
      Not Arrived
    </span>
  );
}

// Generic status pill for Active/Disabled states
interface StatusPillProps {
  status: "Active" | "Disabled";
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium",
      status === "Active" ? "glass-pill-active" : "glass-pill-disabled",
      className
    )}>
      {status}
    </span>
  );
}
