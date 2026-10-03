/**
 * Datos de conexión a Supabase. Si falta alguno, el sitio sigue funcionando con los
 * archivos de `src/data` y el panel administrativo avisa qué falta configurar.
 *
 * Variables de entorno (en `.env.local` y en Vercel → Settings → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   (o la antigua NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Nombre del bucket de Supabase Storage donde van las fotos del menú. */
export const BUCKET = "menu";

/** Las dos filas de la tabla `content`: el menú completo y los datos del sitio. */
export type ContentKey = "menu" | "site";
