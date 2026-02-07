import { useEffect, useRef } from "react";
import { drawQrCodeToCanvas, downloadCanvasAsImage } from "@/lib/qrCanvas";
import { Button } from "@/components/ui/button";

interface QrCodeCanvasProps {
  value: string;
  size?: number;
  filename?: string;
  showDownload?: boolean;
}

export function QrCodeCanvas({
  value,
  size = 200,
  filename = "qr-code.png",
  showDownload = true,
}: QrCodeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      drawQrCodeToCanvas(canvasRef.current, value, size);
    }
  }, [value, size]);

  const handleDownload = () => {
    if (canvasRef.current) {
      downloadCanvasAsImage(canvasRef.current, filename);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="glass-primary-panel p-2"
        style={{ width: size, height: size }}
      />
      {showDownload && (
        <Button onClick={handleDownload} variant="glass-outline">
          Download
        </Button>
      )}
    </div>
  );
}
