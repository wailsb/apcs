import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutShell } from "@/components/LayoutShell";
import { Button } from "@/components/ui/button";
import { Booking } from "@/lib/types";
import { bookingsListService } from "@/services/bookings.service";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "Completed" | "Cancelled">("all");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await bookingsListService.getBookingHistory();
      setHistory(data);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = history.filter((b) =>
    statusFilter === "all" ? true : b.status === statusFilter
  );

  const getStatusTimeline = (booking: Booking) => {
    const steps = [
      { label: "Created", done: true, date: booking.createdAt?.split("T")[0] },
      { label: "Scheduled", done: true, date: booking.date },
      { label: "Scanned", done: !!booking.scannedAt, date: booking.scannedAt?.split("T")[0] },
    ];
    if (booking.status === "Cancelled") {
      steps[2] = { label: "Cancelled", done: true, date: booking.createdAt?.split("T")[0] };
    }
    return steps;
  };

  const handleExportCSV = () => {
    const headers = "Booking ID,Container ID,Date,Time,Status,Enterprise\n";
    const rows = filtered.map((b) =>
      `${b.bookingId},${b.containerId},${b.date},${b.time},${b.status},${b.enterprise}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portly-booking-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <LayoutShell showSidebar={true} role="CARRIER">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Booking History</h1>
            <p className="text-muted-foreground mt-1">Past bookings and completed visits</p>
          </div>
          <Button variant="outline" onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {(["all", "Completed", "Cancelled"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                statusFilter === filter
                  ? "bg-accent text-white"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {filter === "all" ? "All" : filter}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="bg-white border border-border rounded-xl p-16 text-center text-muted-foreground shadow-card">
            Loading history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-border rounded-xl p-16 text-center shadow-card">
            <p className="text-muted-foreground text-lg mb-1">No booking history</p>
            <p className="text-sm text-muted-foreground">Completed and cancelled bookings will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((bk) => {
              const timeline = getStatusTimeline(bk);
              return (
                <div
                  key={bk.bookingId}
                  className="bg-white border border-border rounded-xl p-5 shadow-card list-item-animate"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-foreground">{bk.containerId}</span>
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                          bk.status === "Completed"
                            ? "bg-status-arrived text-status-arrived border-status-arrived/20"
                            : "bg-status-not-arrived text-status-not-arrived border-status-not-arrived/20"
                        )}>
                          {bk.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bk.date} at {bk.time} -- {bk.enterprise}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{bk.bookingId}</span>
                  </div>

                  <div className="flex items-center gap-0">
                    {timeline.map((step, i) => (
                      <div key={step.label} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-3 h-3 rounded-full border-2",
                            step.done
                              ? (bk.status === "Cancelled" && i === 2)
                                ? "bg-status-not-arrived border-status-not-arrived"
                                : "bg-accent border-accent"
                              : "bg-white border-border"
                          )} />
                          <span className={cn(
                            "text-xs mt-1",
                            step.done ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {step.label}
                          </span>
                          {step.date && (
                            <span className="text-[10px] text-muted-foreground">{step.date}</span>
                          )}
                        </div>
                        {i < timeline.length - 1 && (
                          <div className={cn(
                            "w-16 h-0.5 mx-1",
                            timeline[i + 1].done ? "bg-accent" : "bg-border"
                          )} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
