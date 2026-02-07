import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutShell } from "@/components/LayoutShell";
import { Button } from "@/components/ui/button";
import { StatCard, StatCardGrid } from "@/components/StatCard";
import { MapPanel } from "@/components/MapPanel";
import { Booking } from "@/lib/types";
import { bookingsListService } from "@/services/bookings.service";
import { authService } from "@/services/auth.service";
import { QrCodeCanvas } from "@/components/QrCodeCanvas";
import { cn } from "@/lib/utils";
import { Package, CalendarCheck, CheckCircle2, Clock } from "lucide-react";

export default function EnterprisePage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const session = authService.getSession();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingsListService.getBookings();
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(b => 
    ["Scheduled", "Pending"].includes(b.status)
  );
  const completedBookings = bookings.filter(b => 
    ["Completed", "In Progress"].includes(b.status)
  );

  const toggleExpand = (bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      case "In Progress": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <LayoutShell showSidebar={true} role="CARRIER">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Welcome, {session?.firstName || session?.username}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your port bookings and appointments
          </p>
        </div>

        {/* Stats Cards */}
        <StatCardGrid className="lg:grid-cols-4">
          <StatCard
            title="Total Bookings"
            value={bookings.length}
            icon={Package}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="Upcoming"
            value={upcomingBookings.length}
            icon={CalendarCheck}
            delay={100}
          />
          <StatCard
            title="Completed"
            value={completedBookings.length}
            icon={CheckCircle2}
            variant="success"
            delay={200}
          />
          <StatCard
            title="Next Appointment"
            value={upcomingBookings.length > 0 ? 1 : 0}
            subtitle={upcomingBookings[0]?.date || "No upcoming"}
            icon={Clock}
            delay={300}
          />
        </StatCardGrid>

        {/* Map Section */}
        <div className="section-animate" style={{ animationDelay: "400ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-3">Port Locations</h2>
          <MapPanel 
            height="240px"
            markers={[
              { id: "port1", lng: 4.3850, lat: 51.9030, popup: "Port of Rotterdam", color: "hsl(231, 95%, 45%)" },
              { id: "port2", lng: 4.7789, lat: 51.9178, popup: "Terminal A", color: "hsl(160, 84%, 39%)" },
            ]}
          />
        </div>

        {/* Upcoming Bookings */}
        <div className="glass-primary-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Appointments</h2>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading bookings...
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-2">No upcoming appointments</p>
              <p className="text-sm text-muted-foreground">
                Your scheduled bookings will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.bookingId}
                  className="bg-white border border-border rounded-xl shadow-sm overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                    onClick={() => toggleExpand(booking.bookingId)}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-foreground">{booking.containerId}</span>
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                            getStatusColor(booking.status)
                          )}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.date} at {booking.time} • {booking.enterprise}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {booking.accessToken && (
                        <span className="text-xs text-green-600 font-medium">QR Ready</span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {expandedBooking === booking.bookingId ? "Hide" : "Details"}
                      </span>
                    </div>
                  </div>

                  {expandedBooking === booking.bookingId && (
                    <div className="border-t border-border p-5 bg-secondary/20">
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Booking ID:</span>
                          <span className="ml-2 font-medium">{booking.bookingId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Container:</span>
                          <span className="ml-2 font-medium">{booking.containerId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <span className="ml-2 font-medium">{booking.date}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time:</span>
                          <span className="ml-2 font-medium">{booking.time}</span>
                        </div>
                      </div>
                      
                      {booking.accessToken ? (
                        <div className="flex flex-col items-center">
                          <p className="text-sm text-muted-foreground mb-3">
                            Show this QR code at the gate for entry
                          </p>
                          <QrCodeCanvas
                            value={booking.accessToken}
                            size={180}
                            filename={`booking-${booking.bookingId}.png`}
                            showDownload={true}
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">
                          QR code will be available once booking is confirmed
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {completedBookings.length > 0 && (
          <div className="glass-primary-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/enterprise/history")}>
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {completedBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.bookingId}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{booking.containerId}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {booking.date} at {booking.time}
                    </span>
                  </div>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                    getStatusColor(booking.status)
                  )}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
