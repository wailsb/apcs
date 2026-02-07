import { apiClient, PagedResponse } from "./apiClient";

/**
 * Audit Event Types
 */
export type AuditEventType =
  // Booking Events
  | "BOOKING_CREATED"
  | "BOOKING_UPDATED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_EXPIRED"
  | "BOOKING_CHECKED_IN"
  | "BOOKING_COMPLETED"
  // Auth Events
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_LOGOUT"
  | "AUTH_TOKEN_REFRESHED"
  | "AUTH_PASSWORD_CHANGED"
  | "AUTH_USER_CREATED"
  | "AUTH_USER_UPDATED"
  | "AUTH_USER_DISABLED"
  // Gate Events
  | "GATE_CHECK_IN"
  | "GATE_CHECK_OUT"
  | "GATE_ACCESS_DENIED"
  | "GATE_QR_SCANNED"
  | "GATE_MANUAL_OVERRIDE"
  // Slot Events
  | "SLOT_RESERVED"
  | "SLOT_RELEASED"
  | "SLOT_CAPACITY_CHANGED"
  // AI Events
  | "AI_VALIDATION_STARTED"
  | "AI_VALIDATION_COMPLETED"
  | "AI_ANOMALY_DETECTED"
  | "AI_RISK_ASSESSED"
  // Terminal Events
  | "TERMINAL_CREATED"
  | "TERMINAL_UPDATED"
  | "TERMINAL_DISABLED"
  // System Events
  | "SYSTEM_STARTUP"
  | "SYSTEM_SHUTDOWN"
  | "SYSTEM_ERROR"
  | "SYSTEM_CONFIG_CHANGED"
  | "SYSTEM_EVENT"
  | "DATA_EXPORTED"
  | "DATA_ARCHIVED"
  | "DATA_ACCESS";

/**
 * Audit Event Response from backend
 */
export interface AuditEvent {
  id: number;
  eventType: AuditEventType;
  eventTypeDisplay: string;
  eventTypeDescription: string;
  timestamp: string;
  sourceService: string;
  userId: number | null;
  username: string | null;
  entityType: string | null;
  entityId: string | null;
  description: string | null;
  payload: string | null;
  previousState: string | null;
  newState: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  traceId: string | null;
  result: string | null;
  errorMessage: string | null;
  metadata: string | null;
  createdAt: string;
}

/**
 * Audit Event Summary (lighter version for lists)
 */
export interface AuditEventSummary {
  id: number;
  eventType: AuditEventType;
  eventTypeDisplay: string;
  timestamp: string;
  sourceService: string;
  userId: number | null;
  username: string | null;
  entityType: string | null;
  entityId: string | null;
  description: string | null;
  result: string | null;
}

/**
 * Search/filter parameters for audit events
 */
export interface AuditSearchParams {
  eventType?: AuditEventType;
  sourceService?: string;
  userId?: number;
  entityType?: string;
  entityId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

/**
 * Audit Statistics
 */
export interface AuditStatistics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByService: Record<string, number>;
  recentFailures: number;
}

/**
 * Audit Service
 * 
 * Manages audit logs via the audit-service API (port 8085).
 */
export const auditService = {
  /**
   * Search audit events with filters
   * Calls: GET /api/audit/events/search
   */
  searchEvents: async (params: AuditSearchParams = {}): Promise<PagedResponse<AuditEventSummary>> => {
    const queryParams = new URLSearchParams();
    
    if (params.eventType) queryParams.append("eventType", params.eventType);
    if (params.sourceService) queryParams.append("sourceService", params.sourceService);
    if (params.userId) queryParams.append("userId", String(params.userId));
    if (params.entityType) queryParams.append("entityType", params.entityType);
    if (params.entityId) queryParams.append("entityId", params.entityId);
    queryParams.append("page", String(params.page ?? 0));
    queryParams.append("size", String(params.size ?? 20));
    queryParams.append("sortBy", params.sortBy ?? "timestamp");
    queryParams.append("sortDirection", params.sortDirection ?? "DESC");

    const response = await apiClient.get<PagedResponse<AuditEventSummary>>(
      `/api/audit/events/search?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get audit event by ID
   * Calls: GET /api/audit/events/{id}
   */
  getEventById: async (id: number): Promise<AuditEvent> => {
    const response = await apiClient.get<AuditEvent>(`/api/audit/events/${id}`);
    return response.data;
  },

  /**
   * Get events by type
   * Calls: GET /api/audit/events/type/{eventType}
   */
  getEventsByType: async (
    eventType: AuditEventType,
    page = 0,
    size = 20
  ): Promise<PagedResponse<AuditEventSummary>> => {
    const response = await apiClient.get<PagedResponse<AuditEventSummary>>(
      `/api/audit/events/type/${eventType}?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Get events by service
   * Calls: GET /api/audit/events/service/{serviceName}
   */
  getEventsByService: async (
    serviceName: string,
    page = 0,
    size = 20
  ): Promise<PagedResponse<AuditEventSummary>> => {
    const response = await apiClient.get<PagedResponse<AuditEventSummary>>(
      `/api/audit/events/service/${serviceName}?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Get entity audit history
   * Calls: GET /api/audit/events/entity/{entityType}/{entityId}
   */
  getEntityHistory: async (
    entityType: string,
    entityId: string,
    page = 0,
    size = 20
  ): Promise<PagedResponse<AuditEventSummary>> => {
    const response = await apiClient.get<PagedResponse<AuditEventSummary>>(
      `/api/audit/events/entity/${entityType}/${entityId}?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Get user activity
   * Calls: GET /api/audit/events/user/{userId}
   */
  getUserActivity: async (
    userId: number,
    page = 0,
    size = 20
  ): Promise<PagedResponse<AuditEventSummary>> => {
    const response = await apiClient.get<PagedResponse<AuditEventSummary>>(
      `/api/audit/events/user/${userId}?page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Get recent failures
   * Calls: GET /api/audit/events/failures
   */
  getRecentFailures: async (
    hours = 24,
    page = 0,
    size = 20
  ): Promise<PagedResponse<AuditEventSummary>> => {
    const response = await apiClient.get<PagedResponse<AuditEventSummary>>(
      `/api/audit/events/failures?hours=${hours}&page=${page}&size=${size}`
    );
    return response.data;
  },

  /**
   * Get audit statistics
   * Calls: GET /api/audit/statistics
   */
  getStatistics: async (): Promise<AuditStatistics> => {
    const response = await apiClient.get<AuditStatistics>("/api/audit/statistics");
    return response.data;
  },

  /**
   * Get all event types
   * Calls: GET /api/audit/event-types
   */
  getEventTypes: async (): Promise<Array<{ name: AuditEventType; displayName: string; description: string }>> => {
    const response = await apiClient.get<Array<{ name: AuditEventType; displayName: string; description: string }>>(
      "/api/audit/event-types"
    );
    return response.data;
  },
};
