import { 
  BookingResponse, 
  CreateBookingRequest,
  CheckInRequest,
  CheckInResponse,
  SlotAvailabilityResponse,
} from "@/lib/types";
import { apiClient, PagedResponse } from "./apiClient";

export interface BookingConfirmation {
  bookingId: string;
  containerId: string;
  date: string;
  time: string;
}

// ============ Booking Service ============

export const bookingService = {
  /**
   * Create a new booking
   * Calls: POST /api/bookings
   */
  createBooking: async (request: CreateBookingRequest): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>("/api/bookings", request);
    return response.data;
  },

  /**
   * Simple booking for enterprise users - schedules a pickup for an existing container
   * Creates a booking with minimal required info and auto-confirms it
   * Prevents double booking by checking for existing active bookings
   */
  schedulePickup: async (params: {
    containerId: string;
    date: string;
    hour: string;
    terminalId?: number;
  }): Promise<{ success: boolean; bookingId?: string; message: string }> => {
    const { authService } = await import("./auth.service");
    const session = authService.getSession();
    
    if (!session?.userId) {
      return { success: false, message: "Not authenticated" };
    }

    // Check for existing active bookings for this container
    try {
      const userBookings = await bookingService.getUserBookings(session.userId);
      const existingBooking = userBookings.find(
        b => b.containerNumber === params.containerId && 
             ["PENDING", "CONFIRMED", "CHECKED_IN"].includes(b.status)
      );
      
      // If container already has a scheduled/active booking, block it
      if (existingBooking) {
        return {
          success: false,
          message: `Container ${params.containerId} already has an active booking (${existingBooking.referenceNumber})`,
        };
      }
      
      // Check if there's an APPROVED booking for this container - update it instead of creating new
      const approvedBooking = userBookings.find(
        b => b.containerNumber === params.containerId && b.status === "APPROVED"
      );
      
      if (approvedBooking) {
        // Update the existing APPROVED booking with the new date/time and confirm it
        try {
          await bookingService.updateBooking(approvedBooking.id, {
            bookingDate: params.date,
            preferredStartTime: params.hour,
            terminalId: params.terminalId || approvedBooking.terminalId,
          });
          await bookingService.confirmBooking(approvedBooking.id);
          return {
            success: true,
            bookingId: approvedBooking.referenceNumber,
            message: `Booking confirmed for ${params.date} at ${params.hour}`,
          };
        } catch (error) {
          console.warn("Failed to update/confirm existing booking:", error);
          // Fall through to create a new booking
        }
      }
    } catch {
      // If check fails, proceed with creation
    }
    
    const request: CreateBookingRequest = {
      containerNumber: params.containerId,
      bookingDate: params.date,
      preferredStartTime: params.hour,
      terminalId: params.terminalId || 1,
      gateId: 1, // Default gate for Terminal 1 (ALG-G1)
      driverName: session?.firstName ? `${session.firstName} ${session.lastName || ""}`.trim() : "Driver",
      truckPlateNumber: "TBD", // User can update later
      visitPurpose: "PICKUP",
    };

    try {
      const booking = await bookingService.createBooking(request);
      
      // Auto-confirm the booking so it shows as scheduled
      try {
        await bookingService.confirmBooking(booking.id);
      } catch (confirmError) {
        // If confirm fails, booking is still created but in APPROVED state
        console.warn("Auto-confirm failed, booking remains in APPROVED state:", confirmError);
      }
      
      return {
        success: true,
        bookingId: booking.referenceNumber,
        message: `Booking confirmed for ${params.date} at ${params.hour}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create booking",
      };
    }
  },

  /**
   * Get booking by ID
   * Calls: GET /api/bookings/{id}
   */
  getBookingById: async (id: number): Promise<BookingResponse> => {
    const response = await apiClient.get<BookingResponse>(`/api/bookings/${id}`);
    return response.data;
  },

  /**
   * Get booking by reference number
   * Calls: GET /api/bookings/ref/{reference}
   */
  getBookingByReference: async (reference: string): Promise<BookingResponse> => {
    const response = await apiClient.get<BookingResponse>(`/api/bookings/ref/${reference}`);
    return response.data;
  },

  /**
   * Get all bookings for a user
   * Calls: GET /api/bookings/user/{userId}
   */
  getUserBookings: async (userId: number): Promise<BookingResponse[]> => {
    const response = await apiClient.get<BookingResponse[]>(`/api/bookings/user/${userId}`);
    return response.data;
  },

  /**
   * Get paginated bookings for a user
   * Calls: GET /api/bookings/user/{userId}/paged
   */
  getUserBookingsPaged: async (
    userId: number, 
    page = 0, 
    size = 10
  ): Promise<PagedResponse<BookingResponse>> => {
    const response = await apiClient.get<PagedResponse<BookingResponse>>(
      `/api/bookings/user/${userId}/paged?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Get bookings for a terminal on a specific date
   * Calls: GET /api/bookings/terminal/{terminalId}?date={date}
   */
  getTerminalBookings: async (terminalId: number, date: string): Promise<BookingResponse[]> => {
    const response = await apiClient.get<BookingResponse[]>(
      `/api/bookings/terminal/${terminalId}?date=${date}`
    );
    return response.data;
  },

  /**
   * Confirm a booking (generates QR code)
   * Calls: POST /api/bookings/{id}/confirm
   */
  confirmBooking: async (id: number): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>(`/api/bookings/${id}/confirm`);
    return response.data;
  },

  /**
   * Update a booking with new date/time
   * Calls: PUT /api/bookings/{id}
   */
  updateBooking: async (id: number, updates: {
    bookingDate?: string;
    preferredStartTime?: string;
    terminalId?: number;
  }): Promise<BookingResponse> => {
    const response = await apiClient.put<BookingResponse>(`/api/bookings/${id}`, updates);
    return response.data;
  },

  /**
   * Cancel a booking
   * Calls: POST /api/bookings/{id}/cancel
   */
  cancelBooking: async (id: number, reason: string): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>(
      `/api/bookings/${id}/cancel`,
      { reason }
    );
    return response.data;
  },

  /**
   * Process check-in at gate
   * Calls: POST /api/bookings/check-in
   */
  checkIn: async (request: CheckInRequest): Promise<CheckInResponse> => {
    const response = await apiClient.post<CheckInResponse>("/api/bookings/check-in", request);
    return response.data;
  },

  /**
   * Process check-out
   * Calls: POST /api/bookings/{id}/check-out
   */
  checkOut: async (id: number, gateCode: string): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>(
      `/api/bookings/${id}/check-out?gateCode=${encodeURIComponent(gateCode)}`
    );
    return response.data;
  },

  /**
   * Get pickup availability for a container using slot service
   * Calls: GET /api/slots/availability/{terminalId}
   */
  getPickupAvailability: async (terminalId: number = 1): Promise<{ availableDates: string[]; timesByDate: Record<string, string[]> }> => {
    const dates: string[] = [];
    const timesByDate: Record<string, string[]> = {};
    
    // Get availability for next 14 days - fetch in parallel for speed
    const today = new Date();
    const datePromises = [];
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      
      datePromises.push(
        apiClient.get<SlotAvailabilityResponse>(
          `/api/slots/availability/${terminalId}?date=${dateStr}`
        ).then(response => ({ dateStr, response }))
         .catch(() => ({ dateStr, response: null }))
      );
    }
    
    const results = await Promise.all(datePromises);
    
    for (const { dateStr, response } of results) {
      if (response && response.data && response.data.slots) {
        const availableSlots: string[] = response.data.slots
          .filter(s => s.available)
          .map(s => s.startTime);
        
        if (availableSlots.length > 0) {
          dates.push(dateStr);
          // Dedupe times (multiple gates may have same time)
          timesByDate[dateStr] = [...new Set(availableSlots)].sort();
        }
      }
    }
    
    // Sort dates chronologically
    dates.sort();
    
    return { availableDates: dates, timesByDate };
  },

  /**
   * Get available dates for booking
   * Calls: GET /api/slots/availability/{terminalId}
   */
  getAvailableDates: async (terminalId: number = 1): Promise<string[]> => {
    const availability = await bookingService.getPickupAvailability(terminalId);
    return availability.availableDates;
  },

  /**
   * Get available hours for a specific date
   * Calls: GET /api/slots/availability/{terminalId}
   */
  getAvailableHours: async (date: string, terminalId: number = 1): Promise<string[]> => {
    try {
      const response = await apiClient.get<SlotAvailabilityResponse>(
        `/api/slots/availability/${terminalId}?date=${date}`
      );
      const times = response.data.slots
        .filter(s => s.available)
        .map(s => s.startTime);
      // Dedupe and sort times (multiple gates may have same time)
      return [...new Set(times)].sort();
    } catch {
      return [];
    }
  },

  /**
   * Generate QR code payload for a booking
   */
  generateQrPayload: (booking: BookingConfirmation): string => {
    return JSON.stringify({
      bookingId: booking.bookingId,
      containerId: booking.containerId,
      date: booking.date,
      time: booking.time,
    });
  },
};
