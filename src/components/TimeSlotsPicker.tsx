import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeSlotsPickerProps {
  availableHours: string[];
  selectedHour: string | null;
  onHourSelect: (hour: string) => void;
}

export function TimeSlotsPicker({
  availableHours,
  selectedHour,
  onHourSelect,
}: TimeSlotsPickerProps) {
  if (availableHours.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No time slots available for this date.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Select a time slot:</p>
      <div className="grid grid-cols-4 gap-2">
        {availableHours.map((hour) => (
          <Button
            key={hour}
            variant={selectedHour === hour ? "time-slot-selected" : "time-slot"}
            size="slot"
            onClick={() => onHourSelect(hour)}
            className="text-sm"
          >
            {hour}
          </Button>
        ))}
      </div>
    </div>
  );
}
