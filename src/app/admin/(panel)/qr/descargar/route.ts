import { NextResponse, type NextRequest } from "next/server";
import { getSite } from "@/lib/content";
import { slug } from "@/lib/slug";
import { currentAdmin } from "@/lib/supabase/server-client";
import { qrPngFile, qrSvgFile } from "../qr-code";

/**
 * Entrega el código QR como archivo de verdad, con `Content-Disposition: attachment`.
 *
 * Antes los botones apuntaban a una URL `data:`, y Safari en iOS no respeta el atributo
 * `download` con esas: el archivo no se guardaba. Un archivo servido por el servidor se
 * descarga igual en cualquier navegador.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await currentAdmin())) {
    return new NextResponse("Entra al panel para descargar el código.", { status: 401 });
  }

  const png = request.nextUrl.searchParams.get("formato") === "png";
  const site = await getSite();
  const name = `qr-menu-${slug(site.name) || "restaurante"}.${png ? "png" : "svg"}`;

  const body = png ? await qrPngFile() : await qrSvgFile();

  return new NextResponse(body as BodyInit, {
    headers: {
      "Content-Type": png ? "image/png" : "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
