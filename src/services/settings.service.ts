import { PlatformSettings } from "@/lib/types";
import { apiClient } from "./apiClient";

/**
 * Settings Service
 * 
 * Manages platform-wide settings. Settings are stored in the backend
 * and cached locally for performance.
 */

// Local cache for settings
let settingsCache: PlatformSettings | null = null;

export const settingsService = {
  /**
   * Get platform settings
   * Calls: GET /api/settings
   */
  getSettings: async (): Promise<PlatformSettings> => {
    // Return cached settings if available
    if (settingsCache) {
      return { ...settingsCache };
    }

    try {
      const response = await apiClient.get<PlatformSettings>("/api/settings");
      settingsCache = response.data;
      return { ...settingsCache };
    } catch {
      // Return default settings if API fails
      return settingsService.getDefaultSettings();
    }
  },

  /**
   * Update platform settings
   * Calls: PUT /api/settings
   */
  updateSettings: async (updates: Partial<PlatformSettings>): Promise<PlatformSettings> => {
    const response = await apiClient.put<PlatformSettings>("/api/settings", updates);
    settingsCache = response.data;
    return { ...settingsCache };
  },

  /**
   * Get a specific setting value
   * Calls: GET /api/settings/{key}
   */
  getSetting: async <K extends keyof PlatformSettings>(key: K): Promise<PlatformSettings[K]> => {
    const settings = await settingsService.getSettings();
    return settings[key];
  },

  /**
   * Update a specific setting
   * Calls: PATCH /api/settings/{key}
   */
  updateSetting: async <K extends keyof PlatformSettings>(
    key: K, 
    value: PlatformSettings[K]
  ): Promise<PlatformSettings> => {
    return settingsService.updateSettings({ [key]: value } as Partial<PlatformSettings>);
  },

  /**
   * Toggle maintenance mode
   * Calls: POST /api/settings/maintenance
   */
  toggleMaintenanceMode: async (): Promise<boolean> => {
    const current = await settingsService.getSetting("maintenanceMode");
    await settingsService.updateSetting("maintenanceMode", !current);
    return !current;
  },

  /**
   * Clear local settings cache
   * Use when settings might have changed externally
   */
  clearCache: (): void => {
    settingsCache = null;
  },

  /**
   * Get default settings (for when backend is initializing)
   */
  getDefaultSettings: (): PlatformSettings => {
    return {
      platformName: "Port Platform",
      defaultTimeZone: "UTC",
      portStartHour: 6,
      portEndHour: 22,
      numberOfTerminals: 4,
      slotDurationMinutes: 30,
      pauseDurationMinutes: 10,
      defaultCapacity: 5,
      notifyOnBooking: true,
      notifyOnArrival: true,
      notifyOnCancellation: false,
      maintenanceMode: false,
    };
  },
};

export default settingsService;
