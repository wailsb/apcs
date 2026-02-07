import { User, Role, UserResponse } from "@/lib/types";
import { apiClient, PagedResponse } from "./apiClient";

/**
 * Users Service
 * 
 * Manages user data via the auth-service API.
 */
export const usersService = {
  /**
   * Get all users
   * Calls: GET /api/auth/users (admin only)
   */
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<UserResponse[]>("/api/auth/users");
    return response.data.map(userResponseToUser);
  },

  /**
   * Get paginated users
   * Calls: GET /api/auth/users/paged
   */
  getUsersPaged: async (page = 0, size = 10): Promise<PagedResponse<User>> => {
    const response = await apiClient.get<PagedResponse<UserResponse>>(
      `/api/auth/users/paged?page=${page}&size=${size}`
    );
    return {
      ...response.data,
      content: response.data.content.map(userResponseToUser),
    };
  },

  /**
   * Get user by ID
   * Calls: GET /api/auth/users/{id}
   */
  getUserById: async (id: string): Promise<User | undefined> => {
    try {
      const response = await apiClient.get<UserResponse>(`/api/auth/users/${id}`);
      return userResponseToUser(response.data);
    } catch {
      return undefined;
    }
  },

  /**
   * Create a new user
   * Calls: POST /api/auth/users
   */
  createUser: async (userData: Omit<User, "id" | "createdAt"> & { password?: string }): Promise<User> => {
    const [firstName, ...lastNameParts] = userData.name.split(" ");
    
    // Map frontend role to backend role
    const backendRole = frontendToBackendRole(userData.role);
    
    const response = await apiClient.post<UserResponse>("/api/auth/users", {
      username: userData.email.split("@")[0],
      email: userData.email,
      firstName,
      lastName: lastNameParts.join(" ") || firstName,
      role: backendRole, // Backend expects: PORT_ADMIN, TERMINAL_OPERATOR, ENTERPRISE_OWNER, CARRIER
      password: userData.password || generateTempPassword(),
    });
    return userResponseToUser(response.data);
  },

  /**
   * Update user
   * Calls: PUT /api/auth/users/{id}
   */
  updateUser: async (id: string, updates: Partial<User>): Promise<User | undefined> => {
    const updatePayload: Record<string, unknown> = {};
    
    if (updates.name) {
      const [firstName, ...lastNameParts] = updates.name.split(" ");
      updatePayload.firstName = firstName;
      updatePayload.lastName = lastNameParts.join(" ") || firstName;
    }
    if (updates.email) {
      updatePayload.email = updates.email;
    }
    if (updates.role) {
      updatePayload.roles = [updates.role];
    }
    if (updates.status !== undefined) {
      updatePayload.active = updates.status === "Active";
    }

    const response = await apiClient.put<UserResponse>(`/api/auth/users/${id}`, updatePayload);
    return userResponseToUser(response.data);
  },

  /**
   * Toggle user status (Active/Disabled)
   * Calls: PUT /api/auth/users/{id}/status
   */
  toggleUserStatus: async (id: string): Promise<User | undefined> => {
    const user = await usersService.getUserById(id);
    if (!user) return undefined;

    const response = await apiClient.put<UserResponse>(`/api/auth/users/${id}/status`, {
      active: user.status !== "Active"
    });
    return userResponseToUser(response.data);
  },

  /**
   * Delete user
   * Calls: DELETE /api/auth/users/{id}
   */
  deleteUser: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/auth/users/${id}`);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get users by role
   * Calls: GET /api/auth/users?role={role}
   */
  getUsersByRole: async (role: Role): Promise<User[]> => {
    try {
      // Map frontend role to backend role name for the API query
      const backendRole = frontendToBackendRole(role);
      const response = await apiClient.get<UserResponse[]>(`/api/auth/users?role=${backendRole}`);
      return response.data.map(userResponseToUser);
    } catch {
      // If filter endpoint doesn't exist or user lacks permission, filter locally
      try {
        const allUsers = await usersService.getUsers();
        return allUsers.filter(u => u.role === role);
      } catch {
        return [];
      }
    }
  },

  /**
   * Search users by name or email
   * Calls: GET /api/auth/users/search?query={query}
   */
  searchUsers: async (query: string): Promise<User[]> => {
    try {
      const response = await apiClient.get<UserResponse[]>(
        `/api/auth/users/search?query=${encodeURIComponent(query)}`
      );
      return response.data.map(userResponseToUser);
    } catch {
      // If search endpoint doesn't exist, filter locally
      const allUsers = await usersService.getUsers();
      const lowerQuery = query.toLowerCase();
      return allUsers.filter(u => 
        u.name.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery)
      );
    }
  },
};

/**
 * Convert UserResponse from API to User type
 */
function userResponseToUser(response: UserResponse): User {
  // Map backend role to frontend role
  const frontendRole = backendToFrontendRole(response.roles[0] || "ROLE_CARRIER");
  
  return {
    id: String(response.id),
    name: `${response.firstName} ${response.lastName}`,
    email: response.email,
    role: frontendRole,
    status: response.active ? "Active" : "Disabled",
    createdAt: response.createdAt.split("T")[0],
  };
}

/**
 * Map frontend role to backend role
 * Frontend: ADMIN, MANAGER, ENTERPRISE, CARRIER
 * Backend: PORT_ADMIN, TERMINAL_OPERATOR, ENTERPRISE_OWNER, CARRIER
 */
function frontendToBackendRole(frontendRole: Role): string {
  const mapping: Record<Role, string> = {
    "ADMIN": "PORT_ADMIN",
    "MANAGER": "TERMINAL_OPERATOR",
    "ENTERPRISE": "ENTERPRISE_OWNER",
    "CARRIER": "CARRIER",
    "TERMINAL_OPERATOR": "TERMINAL_OPERATOR",
  };
  return mapping[frontendRole] || "CARRIER";
}

/**
 * Map backend role to frontend role
 */
function backendToFrontendRole(backendRole: string): Role {
  const mapping: Record<string, Role> = {
    "ROLE_PORT_ADMIN": "ADMIN",
    "PORT_ADMIN": "ADMIN",
    "ADMIN": "ADMIN",
    "ROLE_TERMINAL_OPERATOR": "MANAGER",
    "TERMINAL_OPERATOR": "MANAGER",
    "MANAGER": "MANAGER",
    "ROLE_ENTERPRISE_OWNER": "ENTERPRISE",
    "ENTERPRISE_OWNER": "ENTERPRISE",
    "ENTERPRISE": "ENTERPRISE",
    "ROLE_CARRIER": "CARRIER",
    "CARRIER": "CARRIER",
  };
  return mapping[backendRole] || "ENTERPRISE";
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

export default usersService;
