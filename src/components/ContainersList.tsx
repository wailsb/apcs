import { ContainerItem } from "@/lib/types";
import { ContainerListItem } from "./ContainerListItem";

interface ContainersListProps {
  containers: ContainerItem[];
  onContainerClick: (container: ContainerItem) => void;
  selectedContainerId?: string | null;
}

export function ContainersList({ containers, onContainerClick, selectedContainerId }: ContainersListProps) {
  return (
    <div className="overflow-hidden py-2">
      {containers.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No containers found.
        </div>
      ) : (
        containers.map((container) => (
          <ContainerListItem
            key={container.id}
            container={container}
            onClick={onContainerClick}
            isSelected={selectedContainerId === container.id}
          />
        ))
      )}
    </div>
  );
}
