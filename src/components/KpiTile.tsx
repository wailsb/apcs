import { cn } from "@/lib/utils";

interface KpiTileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  valueClassName?: string;
  onClick?: () => void;
}

export function KpiTile({ title, value, subtitle, valueClassName, onClick }: KpiTileProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-primary-card p-5",
        onClick && "cursor-pointer"
      )}
    >
      <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
      <p className={cn("text-3xl font-semibold text-foreground", valueClassName)}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
