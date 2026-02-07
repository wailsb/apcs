import { useState, useEffect, useCallback } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { auditService, AuditEventSummary, AuditEventType, AuditEvent } from "@/services/audit.service";
import { PagedResponse } from "@/services/apiClient";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Event type categories for filtering
const EVENT_TYPE_OPTIONS: { value: AuditEventType; label: string; category: string }[] = [
  // Booking Events
  { value: "BOOKING_CREATED", label: "Booking Created", category: "Booking" },
  { value: "BOOKING_UPDATED", label: "Booking Updated", category: "Booking" },
  { value: "BOOKING_CONFIRMED", label: "Booking Confirmed", category: "Booking" },
  { value: "BOOKING_CANCELLED", label: "Booking Cancelled", category: "Booking" },
  { value: "BOOKING_EXPIRED", label: "Booking Expired", category: "Booking" },
  { value: "BOOKING_CHECKED_IN", label: "Booking Checked In", category: "Booking" },
  { value: "BOOKING_COMPLETED", label: "Booking Completed", category: "Booking" },
  // Auth Events
  { value: "AUTH_LOGIN_SUCCESS", label: "Login Success", category: "Auth" },
  { value: "AUTH_LOGIN_FAILED", label: "Login Failed", category: "Auth" },
  { value: "AUTH_LOGOUT", label: "Logout", category: "Auth" },
  { value: "AUTH_TOKEN_REFRESHED", label: "Token Refreshed", category: "Auth" },
  { value: "AUTH_PASSWORD_CHANGED", label: "Password Changed", category: "Auth" },
  { value: "AUTH_USER_CREATED", label: "User Created", category: "Auth" },
  { value: "AUTH_USER_UPDATED", label: "User Updated", category: "Auth" },
  { value: "AUTH_USER_DISABLED", label: "User Disabled", category: "Auth" },
  // Gate Events
  { value: "GATE_CHECK_IN", label: "Gate Check-In", category: "Gate" },
  { value: "GATE_CHECK_OUT", label: "Gate Check-Out", category: "Gate" },
  { value: "GATE_ACCESS_DENIED", label: "Access Denied", category: "Gate" },
  { value: "GATE_QR_SCANNED", label: "QR Scanned", category: "Gate" },
  { value: "GATE_MANUAL_OVERRIDE", label: "Manual Override", category: "Gate" },
  // Slot Events
  { value: "SLOT_RESERVED", label: "Slot Reserved", category: "Slot" },
  { value: "SLOT_RELEASED", label: "Slot Released", category: "Slot" },
  { value: "SLOT_CAPACITY_CHANGED", label: "Capacity Changed", category: "Slot" },
  // AI Events
  { value: "AI_VALIDATION_STARTED", label: "AI Validation Started", category: "AI" },
  { value: "AI_VALIDATION_COMPLETED", label: "AI Validation Completed", category: "AI" },
  { value: "AI_ANOMALY_DETECTED", label: "Anomaly Detected", category: "AI" },
  { value: "AI_RISK_ASSESSED", label: "Risk Assessed", category: "AI" },
  // Terminal Events
  { value: "TERMINAL_CREATED", label: "Terminal Created", category: "Terminal" },
  { value: "TERMINAL_UPDATED", label: "Terminal Updated", category: "Terminal" },
  { value: "TERMINAL_DISABLED", label: "Terminal Disabled", category: "Terminal" },
  // System Events
  { value: "SYSTEM_STARTUP", label: "System Startup", category: "System" },
  { value: "SYSTEM_SHUTDOWN", label: "System Shutdown", category: "System" },
  { value: "SYSTEM_ERROR", label: "System Error", category: "System" },
  { value: "SYSTEM_CONFIG_CHANGED", label: "Config Changed", category: "System" },
  { value: "SYSTEM_EVENT", label: "System Event", category: "System" },
  { value: "DATA_EXPORTED", label: "Data Exported", category: "System" },
  { value: "DATA_ARCHIVED", label: "Data Archived", category: "System" },
  { value: "DATA_ACCESS", label: "Data Access", category: "System" },
];

const SERVICE_OPTIONS = [
  { value: "auth-service", label: "Auth Service" },
  { value: "booking-service", label: "Booking Service" },
  { value: "slot-service", label: "Slot Service" },
  { value: "ai-orchestrator-service", label: "AI Orchestrator" },
  { value: "audit-service", label: "Audit Service" },
];

// Helper to format timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Get badge color based on event type category
const getEventTypeBadgeClass = (eventType: AuditEventType): string => {
  if (eventType.startsWith("BOOKING_")) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (eventType.startsWith("AUTH_")) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  if (eventType.startsWith("GATE_")) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (eventType.startsWith("SLOT_")) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (eventType.startsWith("AI_")) return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
  if (eventType.startsWith("TERMINAL_")) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  if (eventType.startsWith("SYSTEM_") || eventType.startsWith("DATA_")) return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  return "bg-secondary/50 text-foreground border-border/30";
};

// Get result badge class
const getResultBadgeClass = (result: string | null): string => {
  if (!result) return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  const lower = result.toLowerCase();
  if (lower === "success" || lower === "ok") return "bg-green-500/20 text-green-400 border-green-500/30";
  if (lower === "failure" || lower === "error" || lower === "failed") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (lower === "warning" || lower === "partial") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-gray-500/20 text-gray-400 border-gray-500/30";
};

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    searchQuery: "",
    eventType: "" as AuditEventType | "",
    sourceService: "",
    userId: "",
  });

  // Detail dialog
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const loadEvents = useCallback(async (page = 0) => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        size: pagination.size,
        sortBy: "timestamp",
        sortDirection: "DESC" as const,
      };

      if (filters.eventType) params.eventType = filters.eventType;
      if (filters.sourceService) params.sourceService = filters.sourceService;
      if (filters.userId && !isNaN(Number(filters.userId))) {
        params.userId = Number(filters.userId);
      }

      const response: PagedResponse<AuditEventSummary> = await auditService.searchEvents(params);
      
      // Apply client-side search filter if present
      let filteredContent = response.content;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredContent = response.content.filter((event) =>
          event.eventTypeDisplay?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.username?.toLowerCase().includes(query) ||
          event.entityType?.toLowerCase().includes(query) ||
          event.entityId?.toLowerCase().includes(query) ||
          event.sourceService?.toLowerCase().includes(query)
        );
      }

      setEvents(filteredContent);
      setPagination({
        page: response.number,
        size: response.size,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      });
    } catch (error) {
      console.error("Failed to load audit events:", error);
      toast({
        title: "Error",
        description: "Failed to load audit logs. Please try again.",
        variant: "destructive",
      });
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.size]);

  useEffect(() => {
    loadEvents(0);
  }, []);

  const handleSearch = () => {
    loadEvents(0);
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: "",
      eventType: "",
      sourceService: "",
      userId: "",
    });
    // Reload with cleared filters after state update
    setTimeout(() => loadEvents(0), 0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      loadEvents(newPage);
    }
  };

  const handleViewDetails = async (event: AuditEventSummary) => {
    setIsLoadingDetail(true);
    setIsDetailDialogOpen(true);
    try {
      const fullEvent = await auditService.getEventById(event.id);
      setSelectedEvent(fullEvent);
    } catch (error) {
      console.error("Failed to load event details:", error);
      toast({
        title: "Error",
        description: "Failed to load event details.",
        variant: "destructive",
      });
      setIsDetailDialogOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <LayoutShell showSidebar={true} role="ADMIN">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground">View and search system audit trail</p>
        </div>

        {/* Filters Section */}
        <div className="glass-primary-panel p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <Label htmlFor="search" className="text-sm mb-2 block">Search</Label>
              <Input
                id="search"
                placeholder="Search by description, username, entity..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Event Type Filter */}
            <div>
              <Label className="text-sm mb-2 block">Event Type</Label>
              <Select
                value={filters.eventType || "all"}
                onValueChange={(value) => setFilters({ ...filters, eventType: value === "all" ? "" : value as AuditEventType | "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All types</SelectItem>
                  {EVENT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Service Filter */}
            <div>
              <Label className="text-sm mb-2 block">Service</Label>
              <Select
                value={filters.sourceService || "all"}
                onValueChange={(value) => setFilters({ ...filters, sourceService: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {SERVICE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User ID Filter */}
            <div>
              <Label htmlFor="userId" className="text-sm mb-2 block">User ID</Label>
              <Input
                id="userId"
                placeholder="Filter by user ID"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch}>
              Search
            </Button>
            <Button variant="glass-outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Events Table */}
        <div className="glass-primary-panel overflow-hidden">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading audit logs...
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No audit logs found matching your filters.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border/40">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Timestamp</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Event Type</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Service</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Entity</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Result</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                          {formatTimestamp(event.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
                            getEventTypeBadgeClass(event.eventType)
                          )}>
                            {event.eventTypeDisplay}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {event.sourceService || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {event.username || (event.userId ? `User #${event.userId}` : "-")}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {event.entityType && event.entityId
                            ? `${event.entityType}:${event.entityId}`
                            : event.entityType || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {event.result ? (
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
                              getResultBadgeClass(event.result)
                            )}>
                              {event.result}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewDetails(event)}
                            className="text-sm text-accent hover:underline font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                <div className="text-sm text-muted-foreground">
                  Showing {events.length} of {pagination.totalElements} events
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="glass-outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {pagination.page + 1} of {pagination.totalPages || 1}
                  </span>
                  <Button
                    variant="glass-outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Event Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="glass-strong glass-round border-[rgba(87,106,255,0.25)] max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Audit Event Details</DialogTitle>
              <DialogDescription>
                Full details of the selected audit event
              </DialogDescription>
            </DialogHeader>

            {isLoadingDetail ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading event details...
              </div>
            ) : selectedEvent ? (
              <div className="space-y-4 py-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Event ID</Label>
                    <p className="text-foreground font-mono">{selectedEvent.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Timestamp</Label>
                    <p className="text-foreground">{formatTimestamp(selectedEvent.timestamp)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Event Type</Label>
                    <p className="text-foreground">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
                        getEventTypeBadgeClass(selectedEvent.eventType)
                      )}>
                        {selectedEvent.eventTypeDisplay}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Source Service</Label>
                    <p className="text-foreground">{selectedEvent.sourceService || "-"}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <p className="text-foreground">{selectedEvent.eventTypeDescription || selectedEvent.description || "-"}</p>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">User</Label>
                    <p className="text-foreground">
                      {selectedEvent.username || (selectedEvent.userId ? `User #${selectedEvent.userId}` : "-")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">User ID</Label>
                    <p className="text-foreground font-mono">{selectedEvent.userId || "-"}</p>
                  </div>
                </div>

                {/* Entity Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Entity Type</Label>
                    <p className="text-foreground">{selectedEvent.entityType || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Entity ID</Label>
                    <p className="text-foreground font-mono">{selectedEvent.entityId || "-"}</p>
                  </div>
                </div>

                {/* Result */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Result</Label>
                    <p className="text-foreground">
                      {selectedEvent.result ? (
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
                          getResultBadgeClass(selectedEvent.result)
                        )}>
                          {selectedEvent.result}
                        </span>
                      ) : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Trace ID</Label>
                    <p className="text-foreground font-mono text-xs break-all">{selectedEvent.traceId || "-"}</p>
                  </div>
                </div>

                {/* Error Message */}
                {selectedEvent.errorMessage && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Error Message</Label>
                    <p className="text-red-400 bg-red-500/10 p-2 rounded-md text-sm font-mono">
                      {selectedEvent.errorMessage}
                    </p>
                  </div>
                )}

                {/* Network Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">IP Address</Label>
                    <p className="text-foreground font-mono">{selectedEvent.ipAddress || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">User Agent</Label>
                    <p className="text-muted-foreground text-xs truncate" title={selectedEvent.userAgent || ""}>
                      {selectedEvent.userAgent || "-"}
                    </p>
                  </div>
                </div>

                {/* State Changes */}
                {(selectedEvent.previousState || selectedEvent.newState) && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">State Change</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedEvent.previousState && (
                        <div>
                          <Label className="text-muted-foreground text-xs">Previous State</Label>
                          <pre className="text-xs bg-secondary/50 p-2 rounded-md overflow-x-auto max-h-32">
                            {JSON.stringify(JSON.parse(selectedEvent.previousState), null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedEvent.newState && (
                        <div>
                          <Label className="text-muted-foreground text-xs">New State</Label>
                          <pre className="text-xs bg-secondary/50 p-2 rounded-md overflow-x-auto max-h-32">
                            {JSON.stringify(JSON.parse(selectedEvent.newState), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payload */}
                {selectedEvent.payload && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Payload</Label>
                    <pre className="text-xs bg-secondary/50 p-2 rounded-md overflow-x-auto max-h-48">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedEvent.payload), null, 2);
                        } catch {
                          return selectedEvent.payload;
                        }
                      })()}
                    </pre>
                  </div>
                )}

                {/* Metadata */}
                {selectedEvent.metadata && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Metadata</Label>
                    <pre className="text-xs bg-secondary/50 p-2 rounded-md overflow-x-auto max-h-32">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedEvent.metadata), null, 2);
                        } catch {
                          return selectedEvent.metadata;
                        }
                      })()}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No event selected
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LayoutShell>
  );
}
