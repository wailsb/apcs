// API Client placeholder for future backend integration
// This module will be used to make HTTP requests to the backend API

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Base configuration - to be updated when backend is available
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = {
  baseUrl: API_BASE_URL,
  
  // Placeholder methods for future implementation
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    // TODO: Implement actual HTTP GET request
    console.log(`GET ${API_BASE_URL}${endpoint}`);
    throw new Error("API client not implemented - using mock data");
  },
  
  post: async <T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> => {
    // TODO: Implement actual HTTP POST request
    console.log(`POST ${API_BASE_URL}${endpoint}`, data);
    throw new Error("API client not implemented - using mock data");
  },
  
  put: async <T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> => {
    // TODO: Implement actual HTTP PUT request
    console.log(`PUT ${API_BASE_URL}${endpoint}`, data);
    throw new Error("API client not implemented - using mock data");
  },
  
  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    // TODO: Implement actual HTTP DELETE request
    console.log(`DELETE ${API_BASE_URL}${endpoint}`);
    throw new Error("API client not implemented - using mock data");
  },
};
