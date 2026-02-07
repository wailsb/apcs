import { ContainerItem, BookingResponse } from "@/lib/types";
import { bookingService } from "./booking.service";
import { authService } from "./auth.service";
import { apiClient, PagedResponse } from "./apiClient";
import { P } from "vitest/dist/chunks/environment.d.cL3nLXbE.js";

/**
 * Containers Service
 * 
 * This service manages container data. Containers are associated with bookings.
 * This service provides methods to fetch and manage container data from the backend.
 */
export const containersService = {
  /**
   * Get all containers for the current user
   * Fetches from user's bookings and maps to container format
   * Deduplicates by container number, keeping the most advanced booking status
   */
  getContainers: async (): Promise<ContainerItem[]> => {
    const session = authService.getSession();
    if (!session?.userId) {
      return [];
    }

    const bookings = await bookingService.getUserBookings(session.userId);
    
    // Dedupe bookings by container number, keeping the one with highest priority status
    const statusPriority: Record<string, number> = {
      COMPLETED: 6,
      IN_PROGRESS: 5,
      CHECKED_IN: 4,
      CONFIRMED: 3,
      APPROVED: 2,
      PENDING: 1,
      CANCELLED: 0,
      REJECTED: 0,
      NO_SHOW: 0,
    };
    
    const containerMap = new Map<string, BookingResponse>();
    for (const booking of bookings) {
      const containerId = booking.containerNumber || booking.referenceNumber;
      const existing = containerMap.get(containerId);
      
      if (!existing || (statusPriority[booking.status] || 0) > (statusPriority[existing.status] || 0)) {
        containerMap.set(containerId, booking);
      }
    }
    
    return Array.from(containerMap.values()).map(bookingToContainer);
  },

  /**
   * Get paginated containers for the current user
   */
  getContainersPaged: async (page = 0, size = 10): Promise<PagedResponse<ContainerItem>> => {
    const session = authService.getSession();
    if (!session?.userId) {
      return {
        content: [],
        pageable: { pageNumber: 0, pageSize: size },
        totalElements: 0,
        totalPages: 0,
        last: true,
        first: true,
        size,
        number: 0,
        numberOfElements: 0,
        empty: true,
      };
    }

    const bookings = await bookingService.getUserBookingsPaged(session.userId, page, size);
    return {
      ...bookings,
      content: bookings.content.map(bookingToContainer),
    };
  },

  /**
   * Get container by ID (booking reference number)
   */
  getContainerById: async (id: string): Promise<ContainerItem | undefined> => {
    try {
      const booking = await bookingService.getBookingByReference(id);
      return bookingToContainer(booking);
    } catch {
      return undefined;
    }
  },

  /**
   * Update container - creates or updates a booking
   */
  updateContainer: async (id: string, updates: Partial<ContainerItem>): Promise<ContainerItem | undefined> => {
    // If scheduling an appointment, create a new booking
    if (updates.appointmentDate && updates.appointmentHour) {
      try {
        const session = authService.getSession();
        const booking = await bookingService.createBooking({
          containerNumber: id,
          bookingDate: updates.appointmentDate,
          preferredStartTime: updates.appointmentHour,
          terminalId: 1, // Default terminal
          driverName: session?.firstName || "Driver",
          truckPlateNumber: "TRK-001", // Would come from user profile
        });
        return bookingToContainer(booking);
      } catch {
        return undefined;
      }
    }

    // For other updates, we need a dedicated container update endpoint
    // For now, return the current container
    return containersService.getContainerById(id);
  },

  /**
   * Get containers with scheduled appointments
   */
  getScheduledContainers: async (): Promise<ContainerItem[]> => {
    const allContainers = await containersService.getContainers();
    return allContainers.filter(c => c.scheduled);
  },

  /**
   * Get containers that have arrived (checked in)
   */
  getArrivedContainers: async (): Promise<ContainerItem[]> => {
    const allContainers = await containersService.getContainers();
    return allContainers.filter(c => c.arrived);
  },

  /**
   * Get containers pending (not scheduled)
   */
  getPendingContainers: async (): Promise<ContainerItem[]> => {
    const allContainers = await containersService.getContainers();
    return allContainers.filter(c => !c.scheduled);
  },

  /**
   * Get containers for a specific terminal on a date (admin/manager view)
   */
  getTerminalContainers: async (terminalId: number, date: string): Promise<ContainerItem[]> => {
    const bookings = await bookingService.getTerminalBookings(terminalId, date);
    return bookings.map(bookingToContainer);
  },

  /**
   * Search containers by number
   */
  searchContainers: async (query: string): Promise<ContainerItem[]> => {
    try {
      const response = await apiClient.get<BookingResponse[]>(
        `/api/bookings/search?containerNumber=${encodeURIComponent(query)}`
      );
      return response.data.map(bookingToContainer);
    } catch {
      // If search endpoint doesn't exist, filter locally
      const allContainers = await containersService.getContainers();
      return allContainers.filter(c => 
        c.id.toLowerCase().includes(query.toLowerCase())
      );
    }
  },
};

/**
 * Convert a booking response to container item format
 * 
 * arrived = Container is at the port and ready for scheduling
 *   - APPROVED: Container booking approved, physically present or expected
 *   - CHECKED_IN: Container has checked into the port
 *   - IN_PROGRESS, COMPLETED: Operations ongoing or done
 * 
 * scheduled = Container has a confirmed appointment time slot
 *   - CONFIRMED: Time slot confirmed
 *   - CHECKED_IN, IN_PROGRESS, COMPLETED: Already in process
 */
function bookingToContainer(booking: BookingResponse): ContainerItem {
  // Container is "arrived" (available for scheduling) when APPROVED or further in the workflow
  const isArrived = ["APPROVED", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED"].includes(booking.status);
  
  // Container is "scheduled" when it has a confirmed time slot
  const isScheduled = ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED"].includes(booking.status);
  
  return {
    id: booking.containerNumber || booking.referenceNumber,
    date: booking.createdAt.split("T")[0],
    time: booking.createdAt.split("T")[1]?.substring(0, 5) || "00:00",
    arrived: isArrived,
    scheduled: isScheduled,
    appointmentDate: isScheduled ? booking.bookingDate : undefined,
    appointmentHour: isScheduled ? booking.startTime : undefined,
  };
}

export default containersService;
