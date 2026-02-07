import { cn } from "@/lib/utils";

interface QrScannerOverlayProps {
  className?: string;
}

export function QrScannerOverlay({ className }: QrScannerOverlayProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Centered scan frame */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
        {/* Top-left corner */}
        <div className="qr-frame-corner qr-frame-corner--top-left" />
        
        {/* Top-right corner */}
        <div className="qr-frame-corner qr-frame-corner--top-right" />
        
        {/* Bottom-left corner */}
        <div className="qr-frame-corner qr-frame-corner--bottom-left" />
        
        {/* Bottom-right corner */}
        <div className="qr-frame-corner qr-frame-corner--bottom-right" />
      </div>
    </div>
  );
}
