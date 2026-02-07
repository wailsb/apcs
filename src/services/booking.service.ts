import { BookingRequest, BookingResult } from "@/lib/types";
import { containersService } from "./containers.service";
import { generateBookingId } from "@/lib/id";

// Mock pickup availability data
interface PickupAvailability {
  availableDates: string[];
  timesByDate: Record<string, string[]>;
}

// Generate mock availability for next 14 days with 30-minute slots
const generatePickupAvailability = (): PickupAvailability => {
  const availableDates: string[] = [];
  const timesByDate: Record<string, string[]> = {};
  const today = new Date();

  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = date.toISOString().split("T")[0];
    availableDates.push(dateStr);

    // Generate 30-minute time slots from 08:00 to 18:00
    const allSlots = [
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
      "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
      "17:00", "17:30"
    ];

    // Randomly make some slots unavailable (simulate bookings)
    const availableSlots = allSlots.filter(() => Math.random() > 0.3);
    timesByDate[dateStr] = availableSlots.length > 0 ? availableSlots : allSlots.slice(0, 4);
  }

  return { availableDates, timesByDate };
};

let pickupAvailability = generatePickupAvailability();

export interface BookingConfirmation {
  bookingId: string;
  containerId: string;
  date: string;
  time: string;
}

export const bookingService = {
  getPickupAvailability: async (_containerId: string): Promise<PickupAvailability> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return pickupAvailability;
  },

  getAvailableDates: async (): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return pickupAvailability.availableDates;
  },

  getAvailableHours: async (date: string): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return pickupAvailability.timesByDate[date] || [];
  },

  createBooking: async (request: BookingRequest): Promise<BookingResult & { bookingId?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const bookingId = generateBookingId();

    // Update container with appointment info
    await containersService.updateContainer(request.containerId, {
      scheduled: true,
      appointmentDate: request.date,
      appointmentHour: request.hour,
    });

    return {
      success: true,
      message: `Appointment scheduled for ${request.date} at ${request.hour}`,
      bookingId,
    };
  },

  generateQrPayload: (booking: BookingConfirmation): string => {
    return JSON.stringify({
      bookingId: booking.bookingId,
      containerId: booking.containerId,
      date: booking.date,
      time: booking.time,
    });
  },

  // Reset mock data
  reset: (): void => {
    pickupAvailability = generatePickupAvailability();
  },
};
