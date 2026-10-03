import { menu as fileMenu } from "@/data/menu";
import { site as fileSite } from "@/data/site";
import { supabaseReady, type ContentKey } from "@/lib/supabase/config";
import { publicClient } from "@/lib/supabase/public-client";
import type { MenuCategory, SiteSettings } from "@/lib/types";

/**
 * Punto único de lectura del contenido.
 *
 * Si Supabase está configurado y tiene datos guardados, manda Supabase (lo que se edita
 * en el panel administrativo). Si no, se usan los archivos de `src/data`, que siguen
 * sirviendo de respaldo y de contenido inicial.
 */

export type ContentSource = "supabase" | "archivos";

async function read<T>(key: ContentKey): Promise<T | null> {
  if (!supabaseReady) return null;
  try {
    const { data, error } = await publicClient()
      .from("content")
      .select("data")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    return (data?.data as T) ?? null;
  } catch (error) {
    console.error(
      `[content] No se pudo leer "${key}" de Supabase; se usan los datos de src/data.`,
      error,
    );
    return null;
  }
}

export async function getMenu(): Promise<MenuCategory[]> {
  return (await read<MenuCategory[]>("menu")) ?? fileMenu;
}

export async function getSite(): Promise<SiteSettings> {
  return (await read<SiteSettings>("site")) ?? fileSite;
}

/** De dónde salió cada cosa. Lo usa el panel para avisar si todavía no hay nada guardado. */
export async function getContentSources(): Promise<
  Record<ContentKey, ContentSource>
> {
  const [menu, site] = await Promise.all([
    read<MenuCategory[]>("menu"),
    read<SiteSettings>("site"),
  ]);
  return {
    menu: menu ? "supabase" : "archivos",
    site: site ? "supabase" : "archivos",
  };
}

/** Contenido de respaldo, el de `src/data`. Sirve para cargarlo por primera vez en Supabase. */
export const fileContent = { menu: fileMenu, site: fileSite };
