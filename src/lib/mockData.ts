import { ContainerItem, SlotAvailability } from "./types";
import { addDays, format } from "date-fns";

export const mockContainers: ContainerItem[] = [
  { id: "MAEU1234567", date: "2026-02-05", time: "08:30", arrived: true, scheduled: false },
  { id: "MSCU2345678", date: "2026-02-05", time: "09:15", arrived: true, scheduled: false },
  { id: "CMAU3456789", date: "2026-02-06", time: "10:00", arrived: true, scheduled: false },
  { id: "HLCU4567890", date: "2026-02-06", time: "11:45", arrived: true, scheduled: false },
  { id: "OOLU5678901", date: "2026-02-07", time: "07:00", arrived: true, scheduled: false },
  { id: "COSU6789012", date: "2026-02-07", time: "14:30", arrived: true, scheduled: false },
  { id: "EISU7890123", date: "2026-02-08", time: "16:00", arrived: true, scheduled: false },
  { id: "TRHU8901234", date: "2026-02-09", time: "13:15", arrived: true, scheduled: false },
];

// Generate availability for next 14 days
const generateAvailability = (): SlotAvailability[] => {
  const availability: SlotAvailability[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = addDays(today, i);
    const dayOfWeek = date.getDay();
    
    // Skip weekends (no availability)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    // Random hours available (simulate partial availability)
    const allHours = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
    const availableCount = Math.floor(Math.random() * 4) + 3; // 3-6 slots per day
    const shuffled = allHours.sort(() => 0.5 - Math.random());
    const hours = shuffled.slice(0, availableCount).sort();
    
    availability.push({
      date: format(date, "yyyy-MM-dd"),
      hours,
    });
  }
  
  return availability;
};

export const mockAvailability: SlotAvailability[] = generateAvailability();

export const getAvailableDates = (): string[] => {
  return mockAvailability.map((slot) => slot.date);
};

export const getAvailableHours = (date: string): string[] => {
  const slot = mockAvailability.find((s) => s.date === date);
  return slot?.hours || [];
};
