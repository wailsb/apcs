/**
 * Services Index
 * 
 * Central export point for all service modules.
 * 
 * Backend Microservices Architecture:
 * -----------------------------------
 * - Auth Service (8081):     /api/auth/*
 * - Booking Service (8082):  /api/bookings/*
 * - Slot Service (8083):     /api/slots/*, /api/terminals/*
 * - AI Orchestrator (8084):  /api/ai/*
 * - Audit Service (8085):    /api/audit/*
 */

// Core API client
export { apiClient, tokenManager } from "./apiClient";
export type { ApiResponse, ApiError, PagedResponse } from "./apiClient";

// Authentication
export { authService } from "./auth.service";

// Booking Management
export { bookingService } from "./booking.service";
export type { BookingConfirmation } from "./booking.service";

// Time Slots
export { slotsService } from "./slots.service";

// Terminals & Gates
export { terminalsService } from "./terminals.service";

// Containers (legacy/compatibility layer)
export { containersService } from "./containers.service";

// User Management
export { usersService } from "./users.service";

// Enterprise Owners
export { enterpriseOwnersService } from "./enterpriseOwners.service";

// Statistics & Dashboards
export { statsService } from "./stats.service";
export type { AdminStats, RecentActivity, TerminalStats, UpcomingAppointment } from "./stats.service";

// Platform Settings
export { settingsService } from "./settings.service";

// Audit Logs
export { auditService } from "./audit.service";
export type { AuditEvent, AuditEventSummary, AuditEventType, AuditSearchParams, AuditStatistics } from "./audit.service";
