import { ContainerItem } from "@/lib/types";
import { StatusText } from "./StatusText";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ContainerTableProps {
  containers: ContainerItem[];
  onContainerClick: (container: ContainerItem) => void;
}

export function ContainerTable({ containers, onContainerClick }: ContainerTableProps) {
  const handleRowClick = (container: ContainerItem) => {
    onContainerClick(container);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="font-semibold text-foreground">Container ID</TableHead>
            <TableHead className="font-semibold text-foreground">Date</TableHead>
            <TableHead className="font-semibold text-foreground">Time</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {containers.map((container) => (
            <TableRow
              key={container.id}
              onClick={() => handleRowClick(container)}
              className={cn(
                "transition-colors duration-150",
                container.arrived && !container.scheduled
                  ? "cursor-pointer hover:bg-secondary/70"
                  : "cursor-default"
              )}
            >
              <TableCell className="font-medium">{container.id}</TableCell>
              <TableCell>{container.date}</TableCell>
              <TableCell>{container.time}</TableCell>
              <TableCell>
                <StatusText 
                  arrived={container.arrived} 
                  scheduled={container.scheduled} 
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
