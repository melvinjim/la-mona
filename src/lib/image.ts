/**
 * Prepara una foto antes de subirla desde el panel. Las fotos del celular pesan varios MB y la
 * página no necesita tanto: se reducen a 1600 px de lado como máximo y se guardan en WebP.
 * Si algo falla, o el formato no se puede reducir sin perder algo (GIF, SVG, PNG con
 * transparencia sin soporte de WebP), se sube el archivo original.
 */

export type PreparedImage = { blob: Blob; type: string; extension: string };

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

const RESIZABLE = new Set(["image/jpeg", "image/png", "image/webp"]);
const LIGHT_ENOUGH = 600 * 1024;

export async function prepareImage(file: File, maxSide = 1600): Promise<PreparedImage> {
  const original: PreparedImage = {
    blob: file,
    type: file.type,
    extension: EXTENSIONS[file.type] ?? (file.name.split(".").pop() || "jpg").toLowerCase(),
  };
  if (!RESIZABLE.has(file.type)) return original;

  try {
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= maxSide && file.size <= LIGHT_ENOUGH) {
      bitmap.close();
      return original;
    }

    const scale = Math.min(1, maxSide / longest);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return original;
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const toBlob = (type: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.82));

    const webp = await toBlob("image/webp");
    if (webp?.type === "image/webp") {
      return webp.size < file.size || scale < 1
        ? { blob: webp, type: "image/webp", extension: "webp" }
        : original;
    }

    // Sin WebP (Safari antiguo). Un PNG pasado a JPG perdería la transparencia: se sube tal cual.
    if (file.type === "image/png") return original;
    const jpeg = await toBlob("image/jpeg");
    return jpeg && jpeg.size < file.size
      ? { blob: jpeg, type: "image/jpeg", extension: "jpg" }
      : original;
  } catch {
    return original;
  }
}
