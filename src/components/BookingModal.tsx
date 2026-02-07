import { useState, useEffect } from "react";
import { ContainerItem } from "@/lib/types";
import { bookingService, BookingConfirmation } from "@/services/booking.service";
import { CalendarPicker } from "./CalendarPicker";
import { TimeSlotsPicker } from "./TimeSlotsPicker";
import { QrCodeCanvas } from "./QrCodeCanvas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface BookingModalProps {
  container: ContainerItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingComplete: () => void;
}

type ModalStep = "select" | "confirmed";

export function BookingModal({
  container,
  open,
  onOpenChange,
  onBookingComplete,
}: BookingModalProps) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<ModalStep>("select");
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);

  // Load available dates when modal opens
  useEffect(() => {
    if (open && container) {
      loadAvailability();
      setSelectedDate(null);
      setSelectedHour(null);
      setStep("select");
      setBooking(null);
    }
  }, [open, container]);

  // Load available hours when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadAvailableHours(selectedDate);
      setSelectedHour(null);
    }
  }, [selectedDate]);

  const loadAvailability = async () => {
    if (!container) return;
    // Get availability for terminal 1 (default) - later can be based on container's destination
    const availability = await bookingService.getPickupAvailability(1);
    setAvailableDates(availability.availableDates);
  };

  const loadAvailableHours = async (date: string) => {
    // Get available hours for terminal 1 on the selected date
    const hours = await bookingService.getAvailableHours(date, 1);
    setAvailableHours(hours);
  };

  const handleConfirm = async () => {
    if (!container || !selectedDate || !selectedHour) return;

    setIsLoading(true);
    try {
      const result = await bookingService.schedulePickup({
        containerId: container.id,
        date: selectedDate,
        hour: selectedHour,
        terminalId: 1,
      });

      if (result.success && result.bookingId) {
        const bookingData: BookingConfirmation = {
          bookingId: result.bookingId,
          containerId: container.id,
          date: selectedDate,
          time: selectedHour,
        };
        setBooking(bookingData);
        setStep("confirmed");
        toast({
          title: "Appointment Scheduled",
          description: result.message,
        });
      } else {
        toast({
          title: "Booking Failed",
          description: result.message || "Unable to schedule appointment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to schedule appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (step === "confirmed") {
      onBookingComplete();
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
  };

  if (!container) return null;

  const qrPayload = booking ? bookingService.generateQrPayload(booking) : "";
  const qrFilename = booking ? `portly-booking-${booking.bookingId}.png` : "booking.png";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] flex flex-col glass-strong glass-round border-[rgba(87,106,255,0.25)]">
        {step === "select" ? (
          <>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Schedule Appointment</DialogTitle>
              <DialogDescription>
                Container: {container.id}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-4 space-y-6 min-h-0">
              {/* Calendar Section */}
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {selectedDate ? `Selected: ${selectedDate}` : "Select an available pickup date:"}
                </p>
                <CalendarPicker
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              </div>

              {/* Time Slots Section */}
              {selectedDate && (
                <div className="animate-fade-in glass-primary-panel p-4">
                  <TimeSlotsPicker
                    availableHours={availableHours}
                    selectedHour={selectedHour}
                    onHourSelect={handleHourSelect}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t border-border/50">
              <Button
                variant="glass-outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedHour || isLoading}
              >
                {isLoading ? "Scheduling..." : "Confirm"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Booking Confirmed</DialogTitle>
              <DialogDescription>
                Your appointment has been scheduled successfully
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-6 space-y-6 min-h-0">
              {/* Booking Summary */}
              <div className="space-y-2 p-4 glass-primary-panel">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking ID:</span>
                  <span className="font-medium">{booking?.bookingId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Container:</span>
                  <span className="font-medium">{booking?.containerId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{booking?.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{booking?.time}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Present this QR code at the terminal
                </p>
                <QrCodeCanvas
                  value={qrPayload}
                  size={200}
                  filename={qrFilename}
                  showDownload={true}
                />
              </div>
            </div>

            <DialogFooter className="flex-shrink-0 pt-4 border-t border-border/50">
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
