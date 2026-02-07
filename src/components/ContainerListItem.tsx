import { ContainerItem } from "@/lib/types";
import { StatusText } from "./StatusText";
import { cn } from "@/lib/utils";

interface ContainerListItemProps {
  container: ContainerItem;
  onClick: (container: ContainerItem) => void;
  isSelected?: boolean;
}

export function ContainerListItem({ container, onClick, isSelected }: ContainerListItemProps) {
  const isClickable = container.arrived;

  const handleClick = () => {
    onClick(container);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center justify-between py-4 px-5 transition-all duration-200 rounded-xl mx-2 my-1",
        "glass-list-item list-item-animate",
        isClickable ? "cursor-pointer" : "cursor-default",
        isSelected && "border-l-2 border-l-accent bg-accent/5"
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-foreground">{container.id}</span>
        <span className="text-sm text-muted-foreground">
          {container.date} at {container.time}
        </span>
      </div>
      
      <div className="flex-shrink-0">
        <StatusText 
          arrived={container.arrived} 
          scheduled={container.scheduled} 
        />
      </div>
    </div>
  );
}
