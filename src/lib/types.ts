// ============ User & Auth Types ============

export type Role = "ADMIN" | "ENTERPRISE" | "MANAGER" | "CARRIER" | "TERMINAL_OPERATOR";

export interface UserSession {
  role: Role;
  username: string;
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId?: number;
  organizationName?: string;
  organizationType?: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  organizationId?: number;
  organizationName?: string;
  organizationType?: string;
}

// ============ Container / Booking Types ============

export type BookingStatus = 
  | "PENDING" 
  | "APPROVED" 
  | "REJECTED" 
  | "CONFIRMED" 
  | "CHECKED_IN" 
  | "IN_PROGRESS" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "NO_SHOW";

export type VisitPurpose = "PICKUP" | "DELIVERY" | "INSPECTION" | "MAINTENANCE";

export interface ContainerItem {
  id: string;
  date: string;
  time: string;
  arrived: boolean;
  scheduled?: boolean;
  appointmentDate?: string;
  appointmentHour?: string;
}

export interface BookingResponse {
  id: number;
  referenceNumber: string;
  userId: number;
  userEmail: string;
  
  // Driver info
  driverName: string;
  driverPhone?: string;
  driverLicenseNumber?: string;
  driverNationalId?: string;
  
  // Truck info
  truckPlateNumber: string;
  truckType?: string;
  trailerPlateNumber?: string;
  
  // Cargo info
  cargoType?: string;
  cargoWeightKg?: number;
  containerNumber?: string;
  shippingLine?: string;
  billOfLading?: string;
  visitPurpose?: VisitPurpose;
  
  // Terminal & slot info
  terminalId: number;
  terminalCode?: string;
  terminalName?: string;
  gateId?: number;
  gateCode?: string;
  gateName?: string;
  slotId?: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  
  // Status
  status: BookingStatus;
  statusDescription?: string;
  rejectionReason?: string;
  aiScore?: number;
  aiNotes?: string;
  
  // Access control
  qrCode?: string;
  accessToken?: string;
  qrExpiry?: string;
  
  // Check-in/out
  checkInTime?: string;
  checkInGate?: string;
  checkOutTime?: string;
  checkOutGate?: string;
  
  // Audit
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface CreateBookingRequest {
  driverName: string;
  driverPhone?: string;
  driverLicenseNumber?: string;
  driverNationalId?: string;
  truckPlateNumber: string;
  truckType?: string;
  trailerPlateNumber?: string;
  cargoType?: string;
  cargoWeightKg?: number;
  containerNumber?: string;
  shippingLine?: string;
  billOfLading?: string;
  visitPurpose?: VisitPurpose;
  terminalId: number;
  gateId?: number;
  slotId?: number;
  bookingDate: string;
  preferredStartTime: string;
  preferredEndTime?: string;
}

export interface BookingSummary {
  id: number;
  referenceNumber: string;
  driverName: string;
  truckPlateNumber: string;
  containerNumber?: string;
  terminalName: string;
  bookingDate: string;
  startTime: string;
  status: BookingStatus;
}

// Legacy types for backward compatibility
export interface SlotAvailability {
  date: string;
  hours: string[];
}

export interface BookingRequest {
  containerId: string;
  date: string;
  hour: string;
}

export interface BookingResult {
  success: boolean;
  message: string;
}

// ============ Time Slot Types ============

export interface TimeSlotResponse {
  id: number;
  gateId: number;
  gateCode: string;
  gateName: string;
  terminalId: number;
  terminalCode: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  bookedCount: number;
  availableCapacity: number;
  available: boolean;
  blockedReason?: string;
  timeRange?: string;
  availabilityPercentage?: number;
}

export interface SlotAvailabilityResponse {
  terminalId: number;
  terminalCode: string;
  terminalName: string;
  date: string;
  totalSlots: number;
  availableSlots: number;
  totalCapacity: number;
  availableCapacity: number;
  slots: TimeSlotResponse[];
  summary?: string;
}

export interface ReserveSlotRequest {
  slotId: number;
  count?: number;
  bookingReference?: string;
}

export interface ReserveSlotResponse {
  success: boolean;
  slotId: number;
  reservedCount: number;
  remainingCapacity: number;
}

// ============ Terminal Types ============

export interface TerminalResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  active: boolean;
  gateCount: number;
  gates?: GateResponse[];
  slotConfiguration?: SlotConfigurationResponse;
  createdAt: string;
  updatedAt?: string;
}

export interface GateResponse {
  id: number;
  terminalId: number;
  code: string;
  name: string;
  gateType: "ENTRY" | "EXIT" | "BOTH";
  active: boolean;
  capacityOverride?: number;
  createdAt: string;
}

export interface SlotConfigurationResponse {
  terminalId: number;
  slotDurationMinutes: number;
  dayStartTime: string;
  dayEndTime: string;
  defaultCapacityPerSlot: number;
  advanceBookingDays: number;
  bufferMinutes: number;
}

export interface CreateTerminalRequest {
  code: string;
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface CreateGateRequest {
  code: string;
  name: string;
  gateType: "ENTRY" | "EXIT" | "BOTH";
  capacityOverride?: number;
}

// ============ User Management Types ============

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Disabled";
  createdAt: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  organizationId?: number;
  organizationName?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

// ============ Enterprise Owner Types ============

export interface EnterpriseOwner {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
  containersCount: number;
  status: "Active" | "Disabled";
  createdAt: string;
}

// ============ Slot Management Types (Admin) ============

export type SlotStatus = "Open" | "Closed" | "Maintenance";

export interface Slot {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: SlotStatus;
  capacity: number;
  booked: number;
  comment?: string;
}

// ============ Platform Settings Types ============

export interface PlatformSettings {
  platformName: string;
  defaultTimeZone: string;
  // Port operation hours
  portStartHour: number;      // e.g., 6 for 6:00 AM
  portEndHour: number;        // e.g., 22 for 10:00 PM
  // Terminal configuration
  numberOfTerminals: number;  // Number of terminals per port
  // Slot configuration
  slotDurationMinutes: number;  // Default 30 minutes
  pauseDurationMinutes: number; // Default 10 minutes between slots
  defaultCapacity: number;      // Default capacity per slot
  // Notifications
  notifyOnBooking: boolean;
  notifyOnArrival: boolean;
  notifyOnCancellation: boolean;
  // Maintenance
  maintenanceMode: boolean;
}

// ============ Check-in Types ============

export interface CheckInRequest {
  qrCode?: string;
  bookingReference?: string;
  truckPlate?: string;
  gateCode: string;
}

export interface CheckInResponse {
  success: boolean;
  booking?: BookingResponse;
  assignedGate?: string;
  instructions?: string;
  failureReason?: string;
  earlyArrivalMinutes?: number;
  lateArrivalMinutes?: number;
}
