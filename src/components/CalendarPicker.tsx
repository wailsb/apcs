import { useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface CalendarPickerProps {
  availableDates: string[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

export function CalendarPicker({
  availableDates,
  selectedDate,
  onDateSelect,
}: CalendarPickerProps) {
  const [month, setMonth] = useState<Date>(new Date());
  
  // Convert string dates to Date objects for comparison
  const availableDateObjects = availableDates.map((d) => parseISO(d));
  
  const isDateAvailable = (date: Date) => {
    return availableDateObjects.some((availableDate) => 
      isSameDay(date, availableDate)
    );
  };

  const selectedDateObj = selectedDate ? parseISO(selectedDate) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date && isDateAvailable(date)) {
      onDateSelect(format(date, "yyyy-MM-dd"));
    }
  };

  return (
    <div className="flex justify-center">
      <div className="glass-primary-panel p-1">
        <Calendar
          mode="single"
          selected={selectedDateObj}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          disabled={(date) => !isDateAvailable(date)}
          className={cn("p-3 pointer-events-auto")}
          classNames={{
            day_selected: "bg-accent text-accent-foreground hover:bg-accent/90",
            day_today: "bg-secondary text-foreground",
          }}
        />
      </div>
    </div>
  );
}
