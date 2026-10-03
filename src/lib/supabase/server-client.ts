import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/**
 * Cliente con la sesión del administrador, leída de las cookies.
 *
 * Solo para el panel (`/admin`): al usar cookies la página deja de ser estática.
 */
export async function serverClient() {
  const store = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) {
            store.set(name, value, options);
          }
        } catch {
          // Desde un Server Component no se pueden escribir cookies;
          // el refresco de la sesión lo hace `proxy.ts`.
        }
      },
    },
  });
}

/** Administrador conectado, o `null`. */
export async function currentAdmin() {
  const supabase = await serverClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}
