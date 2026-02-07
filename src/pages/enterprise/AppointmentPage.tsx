import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LayoutShell } from "@/components/LayoutShell";
import { CalendarPicker } from "@/components/CalendarPicker";
import { TimeSlotsPicker } from "@/components/TimeSlotsPicker";
import { QrCodeCanvas } from "@/components/QrCodeCanvas";
import { Button } from "@/components/ui/button";
import { bookingService, BookingConfirmation } from "@/services/booking.service";
import { containersService } from "@/services/containers.service";
import { ContainerItem } from "@/lib/types";
import { usePickupAvailability, useAvailableHours, useCreateBooking } from "@/hooks/useBookings";

export default function AppointmentPage() {
  const { containerId } = useParams<{ containerId: string }>();
  const navigate = useNavigate();
  const [container, setContainer] = useState<ContainerItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [notes, setNotes] = useState("");

  const { data: availability } = usePickupAvailability(containerId || "");
  const { data: availableHours = [] } = useAvailableHours(selectedDate || "");
  const createBookingMutation = useCreateBooking();

  const availableDates = availability?.availableDates || [];

  useEffect(() => {
    if (containerId) {
      containersService.getContainerById(containerId).then((c) => {
        if (c) setContainer(c);
      });
    }
  }, [containerId]);

  useEffect(() => {
    if (selectedDate) {
      setSelectedHour(null);
    }
  }, [selectedDate]);

  const handleConfirm = () => {
    if (!containerId || !selectedDate || !selectedHour) return;

    createBookingMutation.mutate(
      {
        containerId,
        date: selectedDate,
        hour: selectedHour,
      },
      {
        onSuccess: (result) => {
          if (result.bookingId) {
            setBooking({
              bookingId: result.bookingId,
              containerId,
              date: selectedDate,
              time: selectedHour,
            });
          }
        },
      }
    );
  };

  const qrPayload = booking ? bookingService.generateQrPayload(booking) : "";
  const qrFilename = booking ? `portly-booking-${booking.bookingId}.png` : "booking.png";

  return (
    <LayoutShell showSidebar={true} role="CARRIER">
      <div className="space-y-6">
        <div className="mb-6">
          <button
            onClick={() => navigate("/enterprise")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
          >
            Back to containers
          </button>
          <h1 className="text-2xl font-semibold text-foreground">Schedule Pickup Appointment</h1>
          <p className="text-muted-foreground mt-1">
            Container: <span className="font-medium text-foreground">{containerId}</span>
            {container?.enterprise && (
              <span className="ml-2 text-muted-foreground">-- {container.enterprise}</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-border rounded-xl p-6 shadow-card section-animate">
              <h2 className="text-lg font-semibold text-foreground mb-1">Select Pickup Date</h2>
              <p className="text-sm text-muted-foreground mb-4">Only available weekday dates are shown</p>
              <CalendarPicker
                availableDates={availableDates}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>

            {selectedDate && (
              <div className="bg-white border border-border rounded-xl p-6 shadow-card section-animate">
                <h2 className="text-lg font-semibold text-foreground mb-1">Select Time Slot</h2>
                <p className="text-sm text-muted-foreground mb-4">30-minute increments -- greyed out slots are unavailable</p>
                <TimeSlotsPicker
                  availableHours={availableHours}
                  selectedHour={selectedHour}
                  onHourSelect={setSelectedHour}
                />
              </div>
            )}

            {selectedDate && selectedHour && !booking && (
              <div className="bg-white border border-border rounded-xl p-6 shadow-card section-animate">
                <h2 className="text-lg font-semibold text-foreground mb-4">Appointment Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Container</span>
                    <span className="font-medium">{containerId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{selectedHour}</span>
                  </div>
                </div>
                <Button
                  onClick={handleConfirm}
                  className="w-full"
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? "Scheduling..." : "Confirm Appointment"}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {booking ? (
              <div className="bg-white border border-border rounded-xl p-6 shadow-card section-animate">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-status-arrived text-status-arrived border border-status-arrived/20 mb-3">
                    Booking Confirmed
                  </div>
                  <p className="text-sm text-muted-foreground">Booking ID: {booking.bookingId}</p>
                </div>

                <div className="space-y-3 mb-6 bg-secondary/50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Container</span>
                    <span className="font-medium">{booking.containerId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{booking.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{booking.time}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center mb-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Present this QR code at the terminal gate
                  </p>
                  <QrCodeCanvas
                    value={qrPayload}
                    size={180}
                    filename={qrFilename}
                    showDownload={true}
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/enterprise/bookings")}
                  >
                    View Bookings
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => navigate("/enterprise")}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white border border-border rounded-xl p-6 shadow-card">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Container Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Container ID</span>
                      <span className="font-medium">{containerId}</span>
                    </div>
                    {container?.enterprise && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Enterprise</span>
                        <span className="font-medium">{container.enterprise}</span>
                      </div>
                    )}
                    {container?.port && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Port</span>
                        <span className="font-medium">{container.port}</span>
                      </div>
                    )}
                    {container?.terminal && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Terminal</span>
                        <span className="font-medium">{container.terminal}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Arrival</span>
                      <span className="font-medium">{container?.date} {container?.time}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border rounded-xl p-6 shadow-card">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Booking Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add optional notes for this appointment..."
                    className="w-full h-24 p-3 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
