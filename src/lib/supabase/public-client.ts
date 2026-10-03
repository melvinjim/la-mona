import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/**
 * Cliente sin sesión, para leer el contenido público del sitio.
 *
 * No toca las cookies a propósito: así la página principal se puede seguir generando
 * de forma estática (ISR) y no se vuelve dinámica en cada visita.
 */
export const publicClient = () =>
  createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
