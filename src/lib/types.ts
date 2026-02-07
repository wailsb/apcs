export type Role = "ADMIN" | "ENTERPRISE" | "MANAGER";

export interface ContainerItem {
  id: string;
  date: string;
  time: string;
  arrived: boolean;
  scheduled?: boolean;
  appointmentDate?: string;
  appointmentHour?: string;
}

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

export interface UserSession {
  role: Role;
  username: string;
}

// User management types
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Disabled";
  createdAt: string;
}

// Enterprise Owner types
export interface EnterpriseOwner {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
  containersCount: number;
  status: "Active" | "Disabled";
  createdAt: string;
}

// Slot management types
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

// Platform settings types
export interface PlatformSettings {
  platformName: string;
  defaultTimeZone: string;
  slotDurationMinutes: number;
  defaultCapacity: number;
  notifyOnBooking: boolean;
  notifyOnArrival: boolean;
  notifyOnCancellation: boolean;
  maintenanceMode: boolean;
}
