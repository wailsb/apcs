import { EnterpriseOwner, UserResponse } from "@/lib/types";
import { apiClient, PagedResponse } from "./apiClient";
import { bookingService } from "./booking.service";

/**
 * Enterprise Owners Service
 * 
 * Manages enterprise owner data. Enterprise owners are users with 
 * the "ENTERPRISE" role who own organizations/companies.
 */
export const enterpriseOwnersService = {
  /**
   * Get all enterprise owners
   * Calls: GET /api/auth/users?role=ENTERPRISE
   */
  getEnterpriseOwners: async (): Promise<EnterpriseOwner[]> => {
    const response = await apiClient.get<UserResponse[]>("/api/auth/users?role=ENTERPRISE");
    
    // Get container counts for each enterprise
    const owners = await Promise.all(
      response.data.map(async (user) => {
        const bookings = await bookingService.getUserBookings(user.id).catch(() => []);
        return userToEnterpriseOwner(user, bookings.length);
      })
    );
    
    return owners;
  },

  /**
   * Get paginated enterprise owners
   * Calls: GET /api/auth/users/paged?role=ENTERPRISE
   */
  getEnterpriseOwnersPaged: async (page = 0, size = 10): Promise<PagedResponse<EnterpriseOwner>> => {
    const response = await apiClient.get<PagedResponse<UserResponse>>(
      `/api/auth/users/paged?role=ENTERPRISE&page=${page}&size=${size}`
    );
    
    const content = await Promise.all(
      response.data.content.map(async (user) => {
        const bookings = await bookingService.getUserBookings(user.id).catch(() => []);
        return userToEnterpriseOwner(user, bookings.length);
      })
    );
    
    return {
      ...response.data,
      content,
    };
  },

  /**
   * Get enterprise owner by ID
   * Calls: GET /api/auth/users/{id}
   */
  getEnterpriseOwnerById: async (id: string): Promise<EnterpriseOwner | undefined> => {
    try {
      const response = await apiClient.get<UserResponse>(`/api/auth/users/${id}`);
      const bookings = await bookingService.getUserBookings(response.data.id).catch(() => []);
      return userToEnterpriseOwner(response.data, bookings.length);
    } catch {
      return undefined;
    }
  },

  /**
   * Create a new enterprise owner
   * Calls: POST /api/auth/users
   */
  createEnterpriseOwner: async (data: Omit<EnterpriseOwner, "id" | "createdAt" | "containersCount">): Promise<EnterpriseOwner> => {
    const [firstName, ...lastNameParts] = data.ownerName.split(" ");
    const response = await apiClient.post<UserResponse>("/api/auth/users", {
      username: data.email.split("@")[0],
      email: data.email,
      firstName,
      lastName: lastNameParts.join(" ") || firstName,
      roles: ["ENTERPRISE"],
      organizationName: data.companyName,
      organizationType: "ENTERPRISE",
      password: generateTempPassword(),
    });
    return userToEnterpriseOwner(response.data, 0);
  },

  /**
   * Update enterprise owner
   * Calls: PUT /api/auth/users/{id}
   */
  updateEnterpriseOwner: async (id: string, updates: Partial<EnterpriseOwner>): Promise<EnterpriseOwner | undefined> => {
    const updatePayload: Record<string, unknown> = {};
    
    if (updates.ownerName) {
      const [firstName, ...lastNameParts] = updates.ownerName.split(" ");
      updatePayload.firstName = firstName;
      updatePayload.lastName = lastNameParts.join(" ") || firstName;
    }
    if (updates.email) {
      updatePayload.email = updates.email;
    }
    if (updates.companyName) {
      updatePayload.organizationName = updates.companyName;
    }
    if (updates.status !== undefined) {
      updatePayload.active = updates.status === "Active";
    }

    const response = await apiClient.put<UserResponse>(`/api/auth/users/${id}`, updatePayload);
    const bookings = await bookingService.getUserBookings(response.data.id).catch(() => []);
    return userToEnterpriseOwner(response.data, bookings.length);
  },

  /**
   * Toggle enterprise owner status
   * Calls: PUT /api/auth/users/{id}/status
   */
  toggleStatus: async (id: string): Promise<EnterpriseOwner | undefined> => {
    const owner = await enterpriseOwnersService.getEnterpriseOwnerById(id);
    if (!owner) return undefined;

    const response = await apiClient.put<UserResponse>(`/api/auth/users/${id}/status`, {
      active: owner.status !== "Active"
    });
    const bookings = await bookingService.getUserBookings(response.data.id).catch(() => []);
    return userToEnterpriseOwner(response.data, bookings.length);
  },

  /**
   * Delete enterprise owner
   * Calls: DELETE /api/auth/users/{id}
   */
  deleteEnterpriseOwner: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/auth/users/${id}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Search enterprise owners by company name or owner name
   */
  searchEnterpriseOwners: async (query: string): Promise<EnterpriseOwner[]> => {
    try {
      const response = await apiClient.get<UserResponse[]>(
        `/api/auth/users/search?query=${encodeURIComponent(query)}&role=ENTERPRISE`
      );
      return Promise.all(
        response.data.map(async (user) => {
          const bookings = await bookingService.getUserBookings(user.id).catch(() => []);
          return userToEnterpriseOwner(user, bookings.length);
        })
      );
    } catch {
      // If search endpoint doesn't exist, filter locally
      const allOwners = await enterpriseOwnersService.getEnterpriseOwners();
      const lowerQuery = query.toLowerCase();
      return allOwners.filter(o => 
        o.companyName.toLowerCase().includes(lowerQuery) ||
        o.ownerName.toLowerCase().includes(lowerQuery)
      );
    }
  },
};

/**
 * Convert UserResponse to EnterpriseOwner
 */
function userToEnterpriseOwner(user: UserResponse, containersCount: number): EnterpriseOwner {
  return {
    id: String(user.id),
    companyName: user.organizationName || "Unknown Company",
    ownerName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    containersCount,
    status: user.active ? "Active" : "Disabled",
    createdAt: user.createdAt.split("T")[0],
  };
}

/**
 * Generate a temporary password for new users
 */
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + "!1";
}

export default enterpriseOwnersService;
