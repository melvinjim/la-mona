import { NextResponse } from "next/server";
import { supabaseReady } from "@/lib/supabase/config";
import { publicClient } from "@/lib/supabase/public-client";

// Siempre se ejecuta de verdad: la idea es que Supabase vea actividad.
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

/**
 * Mantiene activo el proyecto de Supabase. Los proyectos del plan gratuito se pausan después de
 * una semana sin actividad; `vercel.json` programa una llamada a esta dirección todos los días
 * y aquí se hace una lectura mínima de la base de datos.
 *
 * Opcional: si en Vercel existe la variable CRON_SECRET, Vercel la envía sola en cada llamada
 * programada y aquí se exige; así nadie más puede usar esta dirección.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401, headers: noStore });
  }

  if (!supabaseReady) {
    return NextResponse.json(
      { ok: false, error: "Supabase no está configurado" },
      { status: 503, headers: noStore },
    );
  }

  const { error } = await publicClient().from("content").select("key").limit(1);
  if (error) {
    console.error("[keep-alive] Supabase no respondió bien:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 503, headers: noStore });
  }

  return NextResponse.json({ ok: true, at: new Date().toISOString() }, { headers: noStore });
}
