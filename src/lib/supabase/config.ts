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

/**
 * Llave secreta, solo para administrar quién puede entrar al panel (crear y quitar usuarios).
 *
 * Esta llave se salta todas las reglas de seguridad de la base de datos, así que **nunca** lleva
 * el prefijo NEXT_PUBLIC: sin ese prefijo, Next.js no la mete en el código que descarga el
 * navegador, y en el navegador vale `undefined`. Solo existe en el servidor.
 *
 *   SUPABASE_SECRET_KEY   (empieza por sb_secret_; antes se llamaba service_role)
 */
export const SUPABASE_SECRET =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Se pueden administrar los usuarios del panel. Sin la llave secreta, no. */
export const usersReady = Boolean(supabaseReady && SUPABASE_SECRET);

/** Las dos filas de la tabla `content`: el menú completo y los datos del sitio. */
export type ContentKey = "menu" | "site";
