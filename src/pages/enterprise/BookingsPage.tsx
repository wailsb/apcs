import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutShell } from "@/components/LayoutShell";
import { Button } from "@/components/ui/button";
import { Booking } from "@/lib/types";
import { bookingsListService } from "@/services/bookings.service";
import { bookingService } from "@/services/booking.service";
import { QrCodeCanvas } from "@/components/QrCodeCanvas";

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingsListService.getUpcomingBookings();
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  };

  const grouped = bookings.reduce((acc, booking) => {
    if (!acc[booking.date]) acc[booking.date] = [];
    acc[booking.date].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const toggleExpand = (bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  return (
    <LayoutShell showSidebar={true} role="CARRIER">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Bookings</h1>
          <p className="text-muted-foreground mt-1">Upcoming scheduled pickup appointments</p>
        </div>

        {isLoading ? (
          <div className="bg-white border border-border rounded-xl p-16 text-center text-muted-foreground shadow-card">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-16 text-center shadow-card">
            <p className="text-muted-foreground text-lg mb-1">No upcoming bookings</p>
            <p className="text-sm text-muted-foreground mb-4">Schedule a pickup from the containers page</p>
            <Button onClick={() => navigate("/enterprise")}>View Containers</Button>
          </div>
        ) : (
          Object.entries(grouped).map(([date, dateBookings]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
              <div className="space-y-3">
                {dateBookings.map((bk) => (
                  <div
                    key={bk.bookingId}
                    className="bg-white border border-border rounded-xl shadow-card overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => toggleExpand(bk.bookingId)}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-foreground">{bk.containerId}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                            {bk.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {bk.time} -- {bk.enterprise}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {expandedBooking === bk.bookingId ? "Hide QR" : "Show QR"}
                      </span>
                    </div>

                    {expandedBooking === bk.bookingId && (
                      <div className="border-t border-border p-5 flex flex-col items-center bg-secondary/20">
                        <p className="text-sm text-muted-foreground mb-4">
                          Booking ID: {bk.bookingId}
                        </p>
                        <QrCodeCanvas
                          value={bookingService.generateQrPayload({
                            bookingId: bk.bookingId,
                            containerId: bk.containerId,
                            date: bk.date,
                            time: bk.time,
                          })}
                          size={160}
                          filename={`portly-${bk.bookingId}.png`}
                          showDownload={true}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </LayoutShell>
  );
}
