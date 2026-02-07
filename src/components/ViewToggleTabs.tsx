import { cn } from "@/lib/utils";

export type ViewMode = "list" | "calendar";

interface ViewToggleTabsProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggleTabs({ activeView, onViewChange }: ViewToggleTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-secondary/50 rounded-md p-1">
      <button
        onClick={() => onViewChange("list")}
        className={cn(
          "px-4 py-1.5 text-sm font-medium rounded transition-colors duration-150",
          activeView === "list"
            ? "bg-background text-accent shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        List View
      </button>
      <button
        onClick={() => onViewChange("calendar")}
        className={cn(
          "px-4 py-1.5 text-sm font-medium rounded transition-colors duration-150",
          activeView === "calendar"
            ? "bg-background text-accent shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Calendar View
      </button>
    </div>
  );
}
