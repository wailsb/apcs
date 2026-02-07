/**
 * API Client for APCS Backend Microservices
 * 
 * Services:
 * - Auth Service (8081): /api/auth/*
 * - Booking Service (8082): /api/bookings/*
 * - Slot Service (8083): /api/slots/*, /api/terminals/*
 * - AI Orchestrator (8084): /api/ai/*
 * - Audit Service (8085): /api/audit/*
 */

// ============ Response Types ============

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
  errors?: Record<string, string>;
  code?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status?: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ============ Token Management ============

const TOKEN_KEY = "apcs_access_token";
const REFRESH_TOKEN_KEY = "apcs_refresh_token";

export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasValidToken: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    
    try {
      // Decode JWT and check expiry
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = payload.exp * 1000;
      return Date.now() < expiryTime;
    } catch {
      return false;
    }
  },
};

// ============ API Client ============

class ApiClientClass {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      skipAuth?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth token if available and not skipped
    if (!options.skipAuth) {
      const token = tokenManager.getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        
        // Extract user info from JWT token and add as headers for booking service
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.userId) {
            headers["X-User-Id"] = String(payload.userId);
          }
          if (payload.email) {
            headers["X-User-Email"] = payload.email;
          }
        } catch {
          // Ignore token parsing errors
        }
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // Handle 401 Unauthorized - token expired
      if (response.status === 401 && !options.skipAuth) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the request with new token
          return this.request<T>(method, endpoint, options);
        } else {
          // Refresh failed, clear tokens and redirect to login
          tokenManager.clearTokens();
          window.location.href = "/login";
          throw new Error("Session expired. Please login again.");
        }
      }

      // Handle empty responses (204 No Content, etc.)
      const contentType = response.headers.get("content-type");
      let data: ApiResponse<T>;
      
      if (response.status === 204 || !contentType?.includes("application/json")) {
        // Empty or non-JSON response
        data = {
          success: response.ok,
          message: response.ok ? "Success" : "Request failed",
          data: null as T,
        };
      } else {
        const text = await response.text();
        if (!text || text.trim() === "") {
          data = {
            success: response.ok,
            message: response.ok ? "Success" : "Request failed",
            data: null as T,
          };
        } else {
          data = JSON.parse(text) as ApiResponse<T>;
        }
      }

      if (!response.ok) {
        throw {
          code: data.code || "API_ERROR",
          message: data.message || "An error occurred",
          details: data.errors,
          status: response.status,
        } as ApiError;
      }

      return data;
    } catch (error) {
      if ((error as ApiError).code) {
        throw error;
      }
      throw {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Network error occurred",
      } as ApiError;
    }
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success && data.data) {
        tokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async get<T>(endpoint: string, skipAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, { skipAuth });
  }

  async post<T>(endpoint: string, body?: unknown, skipAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, { body, skipAuth });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, { body });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", endpoint, { body });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint);
  }
}

export const apiClient = new ApiClientClass();

// Re-export for convenience
export default apiClient;
