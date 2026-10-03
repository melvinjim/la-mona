import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, supabaseReady } from "@/lib/supabase/config";

/**
 * Mantiene viva la sesión del panel administrativo: refresca el token de Supabase
 * y vuelve a escribir las cookies, que es algo que no se puede hacer desde una página.
 *
 * Solo corre en /admin; el resto del sitio no lo necesita y así sigue siendo estático.
 */
export async function proxy(request: NextRequest) {
  if (!supabaseReady) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, options);
        }
        for (const [name, value] of Object.entries(headers)) {
          response.headers.set(name, value);
        }
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
