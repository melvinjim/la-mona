import QRCode from "qrcode";
import { siteUrl } from "@/lib/site-url";

/** Lo que abre el código: el menú del local, sin carrito. */
export const qrTarget = `${siteUrl.replace(/\/$/, "")}/menu`;

const options = {
  margin: 1,
  errorCorrectionLevel: "M" as const,
  color: { dark: "#1a1a16", light: "#ffffff" },
};

/** Lado en píxeles de los archivos que se descargan. */
export const QR_SIZE = 1200;

/** PNG para la vista previa de la página. */
export const qrPngDataUrl = () => QRCode.toDataURL(qrTarget, { ...options, width: QR_SIZE });

/** PNG como archivo, para descargar. */
export const qrPngFile = () => QRCode.toBuffer(qrTarget, { ...options, width: QR_SIZE });

/**
 * SVG para imprenta.
 *
 * `qrcode` lo entrega solo con `viewBox`, sin alto ni ancho, y así muchos programas lo abren
 * a 31 px (el tamaño de la cuadrícula) o no lo muestran. Se le pone un tamaño explícito:
 * sigue siendo vectorial, se puede agrandar sin perder calidad, pero ya abre utilizable.
 */
export async function qrSvgFile(size = QR_SIZE) {
  const svg = await QRCode.toString(qrTarget, { ...options, type: "svg" });
  return svg.replace("<svg ", `<svg width="${size}" height="${size}" `);
}
