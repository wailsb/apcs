import { PlatformSettings } from "@/lib/types";

// Mock platform settings
let settings: PlatformSettings = {
  platformName: "Port Platform",
  defaultTimeZone: "UTC",
  slotDurationMinutes: 60,
  defaultCapacity: 5,
  notifyOnBooking: true,
  notifyOnArrival: true,
  notifyOnCancellation: false,
  maintenanceMode: false,
};

export const settingsService = {
  getSettings: async (): Promise<PlatformSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { ...settings };
  },

  updateSettings: async (updates: Partial<PlatformSettings>): Promise<PlatformSettings> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    settings = { ...settings, ...updates };
    return { ...settings };
  },

  reset: (): void => {
    settings = {
      platformName: "Port Platform",
      defaultTimeZone: "UTC",
      slotDurationMinutes: 60,
      defaultCapacity: 5,
      notifyOnBooking: true,
      notifyOnArrival: true,
      notifyOnCancellation: false,
      maintenanceMode: false,
    };
  },
};
