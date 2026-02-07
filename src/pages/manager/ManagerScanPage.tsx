import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { QrScannerOverlay } from "@/components/QrScannerOverlay";
import { Button } from "@/components/ui/button";
import { LayoutShell } from "@/components/LayoutShell";
import { cn } from "@/lib/utils";

interface BookingPayload {
  bookingId: string;
  containerId: string;
  date: string;
  time: string;
}

export default function ManagerScanPage() {
  const navigate = useNavigate();
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [parsedBooking, setParsedBooking] = useState<BookingPayload | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<"requesting" | "active" | "error" | "idle">("idle");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);

  const parseQrPayload = (text: string): BookingPayload | null => {
    try {
      const parsed = JSON.parse(text);
      if (parsed.bookingId && parsed.containerId && parsed.date && parsed.time) {
        return parsed as BookingPayload;
      }
      return null;
    } catch {
      return null;
    }
  };

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        // Ignore stop errors
        console.log("Stop error (ignored):", e);
      }
      try {
        scannerRef.current.clear();
      } catch (e) {
        // Ignore clear errors
      }
      scannerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsScanning(false);
    }
  }, []);

  const startScanner = useCallback(async () => {
    // Prevent multiple simultaneous start attempts
    if (isStartingRef.current) {
      return;
    }
    isStartingRef.current = true;

    setError(null);
    setScannedResult(null);
    setParsedBooking(null);
    setIsConfirmed(false);
    setCameraStatus("requesting");

    try {
      // Clean up any existing scanner instance
      await stopScanner();

      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!isMountedRef.current) {
        isStartingRef.current = false;
        return;
      }

      const qrReaderElement = document.getElementById("qr-reader");
      if (!qrReaderElement) {
        throw new Error("QR reader element not found");
      }

      const html5QrCode = new Html5Qrcode("qr-reader", {
        verbose: false,
        formatsToSupport: undefined, // Support all formats
      });
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.333333,
        disableFlip: false,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // QR code detected successfully
          if (isMountedRef.current) {
            setScannedResult(decodedText);
            const booking = parseQrPayload(decodedText);
            setParsedBooking(booking);
            setIsScanning(false);
            setCameraStatus("idle");
          }
          
          // Stop scanner after successful scan
          html5QrCode.stop().catch((e) => {
            console.log("Stop after scan error (ignored):", e);
          });
        },
        () => {
          // QR code not found in frame - this is normal, ignore
        }
      );

      if (isMountedRef.current) {
        setIsScanning(true);
        setCameraStatus("active");
      }
    } catch (err) {
      console.error("Scanner error:", err);
      if (isMountedRef.current) {
        setCameraStatus("error");
        if (err instanceof Error) {
          if (err.message.includes("Permission") || err.message.includes("NotAllowedError")) {
            setError("Camera permission denied. Please allow camera access to scan QR codes.");
          } else if (err.message.includes("NotFoundError") || err.message.includes("NotReadableError")) {
            setError("No camera found or camera is in use. Please ensure your device has an available camera.");
          } else if (err.message.includes("OverconstrainedError")) {
            // Try with any camera if environment camera fails
            try {
              const html5QrCode = new Html5Qrcode("qr-reader", { verbose: false });
              scannerRef.current = html5QrCode;
              await html5QrCode.start(
                { facingMode: "user" },
                { fps: 10, qrbox: { width: 200, height: 200 } },
                (decodedText) => {
                  if (isMountedRef.current) {
                    setScannedResult(decodedText);
                    const booking = parseQrPayload(decodedText);
                    setParsedBooking(booking);
                    setIsScanning(false);
                    setCameraStatus("idle");
                  }
                  html5QrCode.stop().catch(console.error);
                },
                () => {}
              );
              if (isMountedRef.current) {
                setIsScanning(true);
                setCameraStatus("active");
                setError(null);
              }
            } catch {
              setError("Failed to start camera. Please try again.");
            }
          } else {
            setError(`Failed to start camera: ${err.message}`);
          }
        } else {
          setError("Failed to start camera. Please try again.");
        }
        setIsScanning(false);
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [stopScanner]);

  const handleScanAgain = () => {
    setScannedResult(null);
    setParsedBooking(null);
    setIsConfirmed(false);
    startScanner();
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    // Start scanner after component mounts
    const timeoutId = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <LayoutShell showSidebar={true} role="MANAGER">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Scan QR Code</h1>
          <p className="text-muted-foreground mt-1">
            Position the QR code within the camera frame to verify container appointments
          </p>
        </div>

        {/* Camera Preview Container */}
        <div className="max-w-xl mx-auto space-y-6">
          <div className="w-full">
            <div
              className={cn(
                "relative w-full aspect-[4/3] overflow-hidden glass-strong glass-round bg-black/5"
              )}
            >
              {/* QR Reader Container - Clean camera view only */}
              <div 
                id="qr-reader" 
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
              />
              
              {/* QR Scan Frame Overlay */}
              {cameraStatus === "active" && !scannedResult && (
                <QrScannerOverlay />
              )}
              
              {/* Status Overlays */}
              {cameraStatus === "requesting" && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
                  <p className="text-muted-foreground">Requesting camera permission...</p>
                </div>
              )}
              
              {cameraStatus === "active" && !scannedResult && (
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-sm text-white bg-black/50 inline-block px-3 py-1 rounded-full">
                    Point camera at QR code
                  </p>
                </div>
              )}
              
              {scannedResult && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <p className="text-white font-medium">QR Detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 glass-primary-panel text-center">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <Button variant="glass-outline" size="sm" onClick={handleScanAgain}>
                Try again
              </Button>
            </div>
          )}

          {/* Scan Result Panel */}
          <div className="p-4 glass-primary-panel">
            <p className="text-sm text-muted-foreground mb-2">Scan Result:</p>
            {parsedBooking ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking ID:</span>
                  <span className="font-medium">{parsedBooking.bookingId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Container:</span>
                  <span className="font-medium">{parsedBooking.containerId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{parsedBooking.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{parsedBooking.time}</span>
                </div>
              </div>
            ) : scannedResult ? (
              <p className="font-medium text-foreground break-all whitespace-pre-wrap">
                {scannedResult}
              </p>
            ) : (
              <p className="text-muted-foreground">Waiting for scan...</p>
            )}
          </div>

          {/* Confirmation Success */}
          {isConfirmed && (
            <div className="p-4 glass-primary-panel text-center" style={{ background: 'var(--glass-arrived-bg)', borderColor: 'var(--glass-arrived-border)' }}>
              <p className="font-medium" style={{ color: 'var(--glass-arrived-text)' }}>
                Appointment confirmed successfully
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {scannedResult && !isConfirmed && (
              <>
                <Button onClick={handleConfirm} className="flex-1 sm:flex-none sm:min-w-[160px]">
                  Confirm
                </Button>
                <Button 
                  variant="glass-outline" 
                  onClick={handleScanAgain}
                  className="flex-1 sm:flex-none sm:min-w-[160px]"
                >
                  Scan again
                </Button>
              </>
            )}
            {isConfirmed && (
              <Button 
                variant="glass-outline" 
                onClick={handleScanAgain}
                className="sm:min-w-[160px]"
              >
                Scan another
              </Button>
            )}
            {!scannedResult && !error && isScanning && (
              <button
                onClick={stopScanner}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Stop camera
              </button>
            )}
            {!scannedResult && !error && !isScanning && cameraStatus === "idle" && (
              <Button variant="glass-outline" onClick={handleScanAgain}>
                Start camera
              </Button>
            )}
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
