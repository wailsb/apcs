import { 
  Role, 
  UserSession, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  UserResponse 
} from "@/lib/types";
import { apiClient, tokenManager } from "./apiClient";

const SESSION_KEY = "port_platform_session";

export const authService = {
  /**
   * Login with username/email and password
   * Calls: POST /api/auth/login
   * Role is determined by the backend based on user's assigned roles
   */
  login: async (username: string, password: string): Promise<UserSession> => {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/login",
      { username, password } as LoginRequest,
      true // Skip auth for login
    );

    if (response.success && response.data) {
      const auth = response.data;
      
      // Store tokens
      tokenManager.setTokens(auth.accessToken, auth.refreshToken);

      // Determine role from backend response
      // Backend roles have ROLE_ prefix: ROLE_PORT_ADMIN, ROLE_TERMINAL_OPERATOR, ROLE_ENTERPRISE_OWNER, ROLE_CARRIER
      // CARRIER and ENTERPRISE_OWNER both map to ENTERPRISE since they use the same page
      const roleMapping: Record<string, Role> = {
        "ROLE_PORT_ADMIN": "ADMIN",
        "PORT_ADMIN": "ADMIN",
        "ADMIN": "ADMIN",
        "ROLE_TERMINAL_OPERATOR": "MANAGER",
        "TERMINAL_OPERATOR": "MANAGER",
        "MANAGER": "MANAGER",
        "ROLE_ENTERPRISE_OWNER": "ENTERPRISE",
        "ENTERPRISE_OWNER": "ENTERPRISE",
        "ENTERPRISE": "ENTERPRISE",
        "ROLE_CARRIER": "ENTERPRISE",
        "CARRIER": "ENTERPRISE",
      };
      
      // Find the first matching role
      let userRole: Role = "ENTERPRISE";
      for (const backendRole of auth.roles) {
        const mapped = roleMapping[backendRole];
        if (mapped) {
          userRole = mapped;
          break;
        }
      }

      const session: UserSession = {
        role: userRole,
        username: auth.username,
        userId: auth.userId,
        email: auth.email,
        firstName: auth.firstName,
        lastName: auth.lastName,
        organizationId: auth.organizationId,
        organizationName: auth.organizationName,
        organizationType: auth.organizationType,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        expiresIn: auth.expiresIn,
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    }

    throw new Error("Login failed");
  },

  /**
   * Register a new user
   * Calls: POST /api/auth/register
   */
  register: async (request: RegisterRequest): Promise<UserSession> => {
    const response = await apiClient.post<AuthResponse>(
      "/api/auth/register",
      request,
      true
    );

    if (response.success && response.data) {
      const auth = response.data;
      
      tokenManager.setTokens(auth.accessToken, auth.refreshToken);

      const session: UserSession = {
        role: auth.roles[0] as Role,
        username: auth.username,
        userId: auth.userId,
        email: auth.email,
        firstName: auth.firstName,
        lastName: auth.lastName,
        organizationId: auth.organizationId,
        organizationName: auth.organizationName,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        expiresIn: auth.expiresIn,
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    }

    throw new Error("Registration failed");
  },

  /**
   * Logout user and revoke tokens
   * Calls: POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // Ignore errors during logout
    } finally {
      tokenManager.clearTokens();
      localStorage.removeItem(SESSION_KEY);
    }
  },

  /**
   * Get current user info from backend
   * Calls: GET /api/auth/me
   */
  getCurrentUser: async (): Promise<UserResponse | null> => {
    try {
      const response = await apiClient.get<UserResponse>("/api/auth/me");
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Get stored session from localStorage
   */
  getSession: (): UserSession | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    try {
      const session = JSON.parse(stored) as UserSession;
      
      // Verify token is still valid
      if (!tokenManager.hasValidToken()) {
        // Token expired, clear session
        authService.logout();
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return tokenManager.hasValidToken();
  },

  /**
   * Refresh access token
   * Calls: POST /api/auth/refresh
   */
  refreshToken: async (): Promise<boolean> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await apiClient.post<AuthResponse>(
        "/api/auth/refresh",
        { refreshToken },
        true
      );

      if (response.success && response.data) {
        tokenManager.setTokens(
          response.data.accessToken, 
          response.data.refreshToken
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};
