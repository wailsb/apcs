import { apiClient } from "./apiClient";
import { bookingService } from "./booking.service";
import { terminalsService } from "./terminals.service";
import { authService } from "./auth.service";
import { usersService } from "./users.service";

export interface AdminStats {
  totalEnterprises: number;
  totalManagers: number;
  totalContainers: number;
  appointmentsScheduled: number;
  arrivedCount: number;
  notArrivedCount: number;
}

export interface TerminalStats {
  terminalId: number;
  terminalName: string;
  totalBookings: number;
  checkedIn: number;
  completed: number;
  noShows: number;
  utilizationPercent: number;
}

export interface RecentActivity {
  id: string;
  message: string;
  timestamp: string;
  type?: "booking" | "checkin" | "checkout" | "registration";
}

export interface UpcomingAppointment {
  id: string;
  container: string;
  company: string;
  time: string;
  date: string;
  bookingId?: number;
  status?: string;
}

/**
 * Stats Service
 * 
 * Provides dashboard statistics and metrics.
 * Aggregates data from booking, terminal, and user services.
 */
export const statsService = {
  /**
   * Get admin dashboard statistics
   * Aggregates data from multiple services
   */
  getAdminStats: async (): Promise<AdminStats> => {
    // Get user counts by role - these require admin permissions
    let enterprises: unknown[] = [];
    let managers: unknown[] = [];
    
    try {
      [enterprises, managers] = await Promise.all([
        usersService.getUsersByRole("ENTERPRISE").catch(() => []),
        usersService.getUsersByRole("MANAGER").catch(() => []),
      ]);
    } catch {
      // User doesn't have admin permission, use empty arrays
      enterprises = [];
      managers = [];
    }

    // Get today's booking stats from terminals
    let terminals: Awaited<ReturnType<typeof terminalsService.getAllTerminals>> = [];
    try {
      terminals = await terminalsService.getAllTerminals();
    } catch {
      terminals = [];
    }
    
    const today = new Date().toISOString().split("T")[0];
    
    let appointmentsScheduled = 0;
    let arrivedCount = 0;
    let totalContainers = 0;
    
    for (const terminal of terminals) {
      try {
        const bookings = await bookingService.getTerminalBookings(terminal.id, today);
        totalContainers += bookings.length;
        appointmentsScheduled += bookings.filter(b => 
          ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(b.status)
        ).length;
        arrivedCount += bookings.filter(b => 
          ["CHECKED_IN", "IN_PROGRESS", "COMPLETED"].includes(b.status)
        ).length;
      } catch {
        // Skip terminals with errors
      }
    }

    return {
      totalEnterprises: enterprises.length,
      totalManagers: managers.length,
      totalContainers,
      appointmentsScheduled,
      arrivedCount,
      notArrivedCount: Math.max(0, appointmentsScheduled - arrivedCount),
    };
  },

  /**
   * Get statistics for a specific terminal
   * Calls: GET /api/bookings/terminal/{terminalId}?date={date}
   */
  getTerminalStats: async (terminalId: number, date: string): Promise<TerminalStats> => {
    const terminal = await terminalsService.getTerminalById(terminalId);
    const bookings = await bookingService.getTerminalBookings(terminalId, date);
    
    const checkedIn = bookings.filter(b => b.status === "CHECKED_IN").length;
    const completed = bookings.filter(b => b.status === "COMPLETED").length;
    const noShows = bookings.filter(b => b.status === "NO_SHOW").length;
    
    return {
      terminalId,
      terminalName: terminal.name,
      totalBookings: bookings.length,
      checkedIn,
      completed,
      noShows,
      utilizationPercent: bookings.length > 0 
        ? Math.round((completed / bookings.length) * 100) 
        : 0,
    };
  },

  /**
   * Get recent activity feed from audit service
   * Calls: GET /api/audit/recent
   */
  getRecentActivity: async (limit = 10): Promise<RecentActivity[]> => {
    try {
      const response = await apiClient.get<RecentActivity[]>(`/api/audit/recent?limit=${limit}`);
      return response.data || [];
    } catch {
      // Audit service might not be available or user lacks permission
      return [];
    }
  },

  /**
   * Get upcoming appointments for current user
   * Calls: GET /api/bookings/user/{userId}
   */
  getUpcomingAppointments: async (): Promise<UpcomingAppointment[]> => {
    const session = authService.getSession();
    if (!session?.userId) {
      return [];
    }

    const bookings = await bookingService.getUserBookings(session.userId);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    return bookings
      .filter(b => ["CONFIRMED", "APPROVED"].includes(b.status))
      .filter(b => b.bookingDate >= todayStr)
      .slice(0, 5)
      .map((b, idx) => ({
        id: String(idx + 1),
        container: b.containerNumber || b.referenceNumber,
        company: b.terminalName || "Terminal",
        time: b.startTime,
        date: b.bookingDate === todayStr ? "Today" : 
              b.bookingDate === tomorrowStr ? "Tomorrow" : b.bookingDate,
        bookingId: b.id,
        status: b.status,
      }));
  },

  /**
   * Get booking statistics for a date range
   * Aggregates from booking service
   */
  getBookingStats: async (startDate: string, endDate: string, terminalId?: number): Promise<{
    totalBookings: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    noShows: number;
  }> => {
    const terminals = terminalId 
      ? [{ id: terminalId }]
      : await terminalsService.getAllTerminals().catch(() => []);
    
    let totalBookings = 0;
    let confirmed = 0;
    let cancelled = 0;
    let completed = 0;
    let noShows = 0;

    // Iterate through dates in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      
      for (const terminal of terminals) {
        try {
          const bookings = await bookingService.getTerminalBookings(terminal.id, dateStr);
          totalBookings += bookings.length;
          confirmed += bookings.filter(b => b.status === "CONFIRMED").length;
          cancelled += bookings.filter(b => b.status === "CANCELLED").length;
          completed += bookings.filter(b => b.status === "COMPLETED").length;
          noShows += bookings.filter(b => b.status === "NO_SHOW").length;
        } catch {
          // Skip errors
        }
      }
    }

    return {
      totalBookings,
      confirmed,
      cancelled,
      completed,
      noShows,
    };
  },

  /**
   * Get terminal utilization rates
   */
  getTerminalUtilization: async (date: string): Promise<TerminalStats[]> => {
    const terminals = await terminalsService.getAllTerminals();
    const stats: TerminalStats[] = [];

    for (const terminal of terminals) {
      const terminalStats = await statsService.getTerminalStats(terminal.id, date);
      stats.push(terminalStats);
    }

    return stats;
  },
};

export default statsService;
