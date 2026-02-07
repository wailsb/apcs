import { useState } from "react";
import { addDays, format, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { ContainerItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnterpriseCalendarViewProps {
  containers: ContainerItem[];
  onContainerClick: (container: ContainerItem) => void;
}

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

export function EnterpriseCalendarView({ containers, onContainerClick }: EnterpriseCalendarViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const getScheduledContainers = (date: string, hour: string) => {
    return containers.filter(
      (c) => c.scheduled && c.appointmentDate === date && c.appointmentHour === hour
    );
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {format(currentWeekStart, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevWeek}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            Next
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-8 bg-secondary/30">
          <div className="p-3 border-r border-border text-sm font-medium text-muted-foreground">
            Time
          </div>
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="p-3 border-r border-border last:border-r-0 text-center"
            >
              <div className="text-xs text-muted-foreground">
                {format(day, "EEE")}
              </div>
              <div className="text-sm font-semibold">
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        {timeSlots.map((slot) => (
          <div key={slot} className="grid grid-cols-8 border-t border-border">
            <div className="p-3 border-r border-border text-sm text-muted-foreground bg-secondary/10">
              {slot}
            </div>
            {weekDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const scheduled = getScheduledContainers(dateStr, slot);
              
              return (
                <div
                  key={`${dateStr}-${slot}`}
                  className="p-2 border-r border-border last:border-r-0 min-h-[60px]"
                >
                  {scheduled.map((container) => (
                    <div
                      key={container.id}
                      onClick={() => onContainerClick(container)}
                      className={cn(
                        "text-xs p-2 rounded border cursor-pointer transition-colors",
                        "bg-accent/5 border-accent/20 text-accent hover:bg-accent/10"
                      )}
                    >
                      {container.id}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
