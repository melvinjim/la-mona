import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SECRET, SUPABASE_URL } from "./config";

/**
 * Cliente con la llave secreta. Solo sirve para administrar los usuarios del panel.
 *
 * Esta llave puede todo y se salta las reglas de la base de datos, así que este archivo solo se
 * importa desde acciones del servidor. Si alguien lo importara desde un componente del
 * navegador, la llave llegaría vacía (Next.js no publica las variables sin NEXT_PUBLIC) y el
 * cliente fallaría, en vez de filtrarla.
 */
export const adminClient = () =>
  createClient(SUPABASE_URL, SUPABASE_SECRET, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
