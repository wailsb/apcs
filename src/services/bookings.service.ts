import { Booking, BookingResponse } from "@/lib/types";
import { bookingService } from "./booking.service";
import { authService } from "./auth.service";

/**
 * Maps backend BookingResponse to UI-friendly Booking type
 */
function mapBookingResponseToBooking(response: BookingResponse): Booking {
  // Map backend status to UI status
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    APPROVED: "Scheduled",
    CONFIRMED: "Scheduled",
    CHECKED_IN: "In Progress",
    IN_PROGRESS: "In Progress", 
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
    NO_SHOW: "No Show",
  };

  return {
    bookingId: response.referenceNumber,
    containerId: response.containerNumber || response.truckPlateNumber,
    date: response.bookingDate,
    time: response.startTime,
    status: statusMap[response.status] || response.status,
    enterprise: response.terminalName || "Terminal",
    createdAt: response.createdAt,
    scannedAt: response.checkInTime,
    accessToken: response.accessToken,
  };
}

export const bookingsListService = {
  /**
   * Get all bookings for current user
   */
  getBookings: async (): Promise<Booking[]> => {
    const session = authService.getSession();
    if (!session?.userId) return [];

    try {
      const responses = await bookingService.getUserBookings(session.userId);
      return responses
        .map(mapBookingResponseToBooking)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      return [];
    }
  },

  /**
   * Get upcoming/scheduled bookings (APPROVED, CONFIRMED, PENDING)
   */
  getUpcomingBookings: async (): Promise<Booking[]> => {
    const session = authService.getSession();
    if (!session?.userId) return [];

    try {
      const responses = await bookingService.getUserBookings(session.userId);
      const upcoming = responses.filter(b => 
        ["PENDING", "APPROVED", "CONFIRMED"].includes(b.status)
      );
      return upcoming
        .map(mapBookingResponseToBooking)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error("Failed to fetch upcoming bookings:", error);
      return [];
    }
  },

  /**
   * Get booking history (COMPLETED, CANCELLED, NO_SHOW, REJECTED)
   */
  getBookingHistory: async (): Promise<Booking[]> => {
    const session = authService.getSession();
    if (!session?.userId) return [];

    try {
      const responses = await bookingService.getUserBookings(session.userId);
      const history = responses.filter(b => 
        ["COMPLETED", "CANCELLED", "NO_SHOW", "REJECTED", "CHECKED_IN", "IN_PROGRESS"].includes(b.status)
      );
      return history
        .map(mapBookingResponseToBooking)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Failed to fetch booking history:", error);
      return [];
    }
  },
};
