import { QrCode, Ecc } from "./qrcodegen";

export interface QrCanvasOptions {
  lightColor?: string;
  darkColor?: string;
  border?: number;
}

/**
 * Draws a QR code to a canvas element
 */
export function drawQrCodeToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  size: number,
  options: QrCanvasOptions = {}
): void {
  const { lightColor = "#FFFFFF", darkColor = "#000000", border = 4 } = options;

  const qr = QrCode.encodeText(text, Ecc.MEDIUM);
  const scale = size / (qr.size + border * 2);

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Fill background
  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, size, size);

  // Draw modules
  ctx.fillStyle = darkColor;
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) {
        ctx.fillRect(
          (x + border) * scale,
          (y + border) * scale,
          scale,
          scale
        );
      }
    }
  }
}

/**
 * Converts canvas to PNG data URL
 */
export function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

/**
 * Triggers download of canvas as PNG image
 */
export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename: string
): void {
  const dataUrl = canvasToDataUrl(canvas);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
