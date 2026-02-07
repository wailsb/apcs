import { 
  TimeSlotResponse, 
  SlotAvailabilityResponse,
  ReserveSlotRequest,
  ReserveSlotResponse,
} from "@/lib/types";
import { apiClient } from "./apiClient";

/**
 * Slots Service
 * 
 * Interacts with the Slot Service (port 8083)
 * Endpoints: /api/slots/*
 */
export const slotsService = {
  /**
   * Generate time slots for a gate on a specific date
   * Calls: POST /api/slots/generate?gateId={gateId}&date={date}
   */
  generateSlots: async (gateId: number, date: string): Promise<TimeSlotResponse[]> => {
    const response = await apiClient.post<TimeSlotResponse[]>(
      `/api/slots/generate?gateId=${gateId}&date=${date}`
    );
    return response.data;
  },

  /**
   * Generate slots for all gates of a terminal for a date range
   * Calls: POST /api/slots/generate/terminal/{terminalId}
   */
  generateSlotsForTerminal: async (
    terminalId: number, 
    startDate: string, 
    endDate: string
  ): Promise<void> => {
    await apiClient.post(
      `/api/slots/generate/terminal/${terminalId}?startDate=${startDate}&endDate=${endDate}`
    );
  },

  /**
   * Get time slots for a gate on a specific date
   * Calls: GET /api/slots/gate/{gateId}?date={date}
   */
  getSlotsForGate: async (gateId: number, date: string): Promise<TimeSlotResponse[]> => {
    const response = await apiClient.get<TimeSlotResponse[]>(
      `/api/slots/gate/${gateId}?date=${date}`
    );
    return response.data;
  },

  /**
   * Get slot availability for a terminal on a date
   * Calls: GET /api/slots/availability/{terminalId}?date={date}
   */
  getAvailability: async (terminalId: number, date: string): Promise<SlotAvailabilityResponse> => {
    const response = await apiClient.get<SlotAvailabilityResponse>(
      `/api/slots/availability/${terminalId}?date=${date}`
    );
    return response.data;
  },

  /**
   * Get time slot by ID
   * Calls: GET /api/slots/{id}
   */
  getSlotById: async (id: number): Promise<TimeSlotResponse> => {
    const response = await apiClient.get<TimeSlotResponse>(`/api/slots/${id}`);
    return response.data;
  },

  /**
   * Check if slot has availability
   * Calls: GET /api/slots/{id}/check?count={count}
   */
  checkAvailability: async (id: number, count = 1): Promise<boolean> => {
    const response = await apiClient.get<boolean>(`/api/slots/${id}/check?count=${count}`);
    return response.data;
  },

  /**
   * Reserve capacity in a slot
   * Calls: POST /api/slots/reserve
   */
  reserveSlot: async (request: ReserveSlotRequest): Promise<ReserveSlotResponse> => {
    const response = await apiClient.post<ReserveSlotResponse>("/api/slots/reserve", request);
    return response.data;
  },

  /**
   * Release capacity from a slot
   * Calls: POST /api/slots/{id}/release?count={count}
   */
  releaseSlot: async (id: number, count = 1): Promise<void> => {
    await apiClient.post(`/api/slots/${id}/release?count=${count}`);
  },

  /**
   * Block a time slot
   * Calls: POST /api/slots/{id}/block?reason={reason}
   */
  blockSlot: async (id: number, reason: string): Promise<TimeSlotResponse> => {
    const response = await apiClient.post<TimeSlotResponse>(
      `/api/slots/${id}/block?reason=${encodeURIComponent(reason)}`
    );
    return response.data;
  },

  /**
   * Unblock a time slot
   * Calls: POST /api/slots/{id}/unblock
   */
  unblockSlot: async (id: number): Promise<TimeSlotResponse> => {
    const response = await apiClient.post<TimeSlotResponse>(`/api/slots/${id}/unblock`);
    return response.data;
  },

  // ============ Helper Methods ============

  /**
   * Get available slots for a terminal on a date (convenience method)
   */
  getAvailableSlots: async (terminalId: number, date: string): Promise<TimeSlotResponse[]> => {
    const availability = await slotsService.getAvailability(terminalId, date);
    return availability.slots.filter(slot => slot.available);
  },

  /**
   * Get available time strings for a terminal on a date (for dropdown/picker)
   */
  getAvailableTimes: async (terminalId: number, date: string): Promise<string[]> => {
    const slots = await slotsService.getAvailableSlots(terminalId, date);
    return slots.map(slot => slot.startTime);
  },
};

export default slotsService;
